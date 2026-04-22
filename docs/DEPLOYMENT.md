# AWS Fargate Deployment Guide

## Architecture overview

```
Internet
    │  HTTPS (443)
    ▼
Route 53  ──→  CloudFront (optional CDN / WAF)
                    │
                    ▼
             Application Load Balancer (ALB)
             ACM certificate (TLS termination)
                    │  HTTP (80 → internal)
                    ▼
             ECS Fargate Service
             ┌─────────────────────────┐
             │  Task (container)       │
             │  proto-pie-map:latest   │
             │  port 3000              │
             └─────────────────────────┘
                    │
                    ▼
             Amazon ECR
             (Docker image registry)

CI/CD: GitHub → GitHub Actions → ECR → ECS rolling deploy
```

All infrastructure is in a single AWS region. The ALB terminates TLS; the container
speaks plain HTTP internally. CloudFront is recommended for global latency but optional.

---

## Prerequisites

| Tool | Purpose | Install |
|---|---|---|
| AWS CLI v2 | Provision resources | [docs.aws.amazon.com/cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| Docker | Build & test images locally | [docker.com](https://www.docker.com/get-started) |
| Git | Source control | [git-scm.com](https://git-scm.com) |
| GitHub account | Repo + Actions runner | [github.com](https://github.com) |
| AWS account | Target environment | — |
| Registered domain | For HTTPS | Route 53 or external registrar |

Configure the CLI before starting:
```bash
aws configure
# AWS Access Key ID: <your key>
# AWS Secret Access Key: <your secret>
# Default region name: us-east-1
# Default output format: json
```

---

## Step 1 — Create an ECR repository

ECR is the private Docker registry where built images are stored.

```bash
aws ecr create-repository \
  --repository-name proto-pie-map \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

Note the `repositoryUri` in the output — format: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/proto-pie-map`.

Enable tag immutability to prevent image overwrites (except `latest`):
```bash
aws ecr put-image-tag-mutability \
  --repository-name proto-pie-map \
  --image-tag-mutability IMMUTABLE \
  --region us-east-1
```

Set a lifecycle policy to keep costs down (keep last 10 images):
```bash
aws ecr put-lifecycle-policy \
  --repository-name proto-pie-map \
  --lifecycle-policy-text '{
    "rules": [{
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {"tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 10},
      "action": {"type": "expire"}
    }]
  }'
```

---

## Step 2 — Push the initial image

```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS \
    --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build
docker build -t proto-pie-map:latest .

# Tag
docker tag proto-pie-map:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/proto-pie-map:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/proto-pie-map:latest
```

---

## Step 3 — Networking (VPC)

Use the default VPC for simplicity, or create a dedicated one.  
The ALB needs at least two subnets in different AZs.

```bash
# List available subnets (pick two in different AZs)
aws ec2 describe-subnets \
  --filters "Name=default-for-az,Values=true" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone]' \
  --output table

# Store for later steps
SUBNET_A=subnet-xxxxxxxx
SUBNET_B=subnet-yyyyyyyy
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" \
           --query 'Vpcs[0].VpcId' --output text)
```

### Security groups

```bash
# ALB security group — public HTTPS/HTTP ingress
aws ec2 create-security-group \
  --group-name proto-pie-map-alb \
  --description "ALB for proto-pie-map" \
  --vpc-id $VPC_ID

ALB_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=proto-pie-map-alb" \
  --query 'SecurityGroups[0].GroupId' --output text)

aws ec2 authorize-security-group-ingress --group-id $ALB_SG \
  --ip-permissions \
  'IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0}]' \
  'IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]'

# Container security group — only allow traffic from the ALB
aws ec2 create-security-group \
  --group-name proto-pie-map-ecs \
  --description "ECS tasks for proto-pie-map" \
  --vpc-id $VPC_ID

ECS_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=proto-pie-map-ecs" \
  --query 'SecurityGroups[0].GroupId' --output text)

aws ec2 authorize-security-group-ingress --group-id $ECS_SG \
  --ip-permissions \
  "[{\"IpProtocol\":\"tcp\",\"FromPort\":3000,\"ToPort\":3000,\
\"UserIdGroupPairs\":[{\"GroupId\":\"$ALB_SG\"}]}]"
```

---

## Step 4 — IAM roles

### Task execution role (ECS pulls images from ECR, writes logs to CloudWatch)

```bash
# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole-proto-pie-map \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"ecs-tasks.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

# Attach managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole-proto-pie-map \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### GitHub Actions deployment role (CI/CD only needs push to ECR + update ECS)

```bash
# Create a least-privilege policy for CI/CD
aws iam create-policy \
  --policy-name GitHubActions-proto-pie-map \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ECRAuth",
        "Effect": "Allow",
        "Action": "ecr:GetAuthorizationToken",
        "Resource": "*"
      },
      {
        "Sid": "ECRPush",
        "Effect": "Allow",
        "Action": [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ],
        "Resource": "arn:aws:ecr:us-east-1:<account-id>:repository/proto-pie-map"
      },
      {
        "Sid": "ECSUpdateService",
        "Effect": "Allow",
        "Action": [
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
          "ecs:DescribeServices"
        ],
        "Resource": "*"
      },
      {
        "Sid": "PassExecutionRole",
        "Effect": "Allow",
        "Action": "iam:PassRole",
        "Resource": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole-proto-pie-map"
      }
    ]
  }'

# Create a user and attach the policy, then generate access keys for GitHub Actions secrets
aws iam create-user --user-name github-actions-proto-pie-map
aws iam attach-user-policy \
  --user-name github-actions-proto-pie-map \
  --policy-arn arn:aws:iam::<account-id>:policy/GitHubActions-proto-pie-map
aws iam create-access-key --user-name github-actions-proto-pie-map
# → Save AccessKeyId and SecretAccessKey as GitHub Actions secrets:
#   AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
```

---

## Step 5 — ECS cluster

```bash
aws ecs create-cluster \
  --cluster-name proto-pie-map-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1 \
  --settings name=containerInsights,value=enabled
```

---

## Step 6 — CloudWatch log group

```bash
aws logs create-log-group \
  --log-group-name /ecs/proto-pie-map \
  --retention-in-days 30
```

---

## Step 7 — ECS task definition

Save the following as `task-definition.json` (replace placeholders):

```json
{
  "family": "proto-pie-map-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole-proto-pie-map",
  "containerDefinitions": [
    {
      "name": "proto-pie-map",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/proto-pie-map:latest",
      "portMappings": [
        { "containerPort": 3000, "protocol": "tcp" }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT",     "value": "3000" }
      ],
      "essential": true,
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:3000/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group":         "/ecs/proto-pie-map",
          "awslogs-region":        "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "readonlyRootFilesystem": true,
      "linuxParameters": {
        "initProcessEnabled": true
      }
    }
  ]
}
```

Register it:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

---

## Step 8 — Application Load Balancer & HTTPS

### ACM certificate (must be in us-east-1 or the ALB's region)
```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
# Follow the DNS validation instructions in the AWS console or via Route 53
```

### Create the ALB
```bash
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name proto-pie-map-alb \
  --subnets $SUBNET_A $SUBNET_B \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Target group
TG_ARN=$(aws elbv2 create-target-group \
  --name proto-pie-map-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path / \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --health-check-interval-seconds 30 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# HTTPS listener (attach ACM certificate)
CERT_ARN=$(aws acm list-certificates \
  --query "CertificateSummaryList[?DomainName=='yourdomain.com'].CertificateArn" \
  --output text)

aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT_ARN \
  --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN

# HTTP → HTTPS redirect
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions \
    Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
```

---

## Step 9 — ECS service

```bash
aws ecs create-service \
  --cluster proto-pie-map-cluster \
  --service-name proto-pie-map-service \
  --task-definition proto-pie-map-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration \
    "awsvpcConfiguration={
      subnets=[$SUBNET_A,$SUBNET_B],
      securityGroups=[$ECS_SG],
      assignPublicIp=ENABLED
    }" \
  --load-balancers \
    "targetGroupArn=$TG_ARN,containerName=proto-pie-map,containerPort=3000" \
  --health-check-grace-period-seconds 30 \
  --deployment-configuration \
    "minimumHealthyPercent=100,maximumPercent=200,
     deploymentCircuitBreaker={enable=true,rollback=true}"
```

---

## Step 10 — DNS (Route 53)

```bash
# Get the ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names proto-pie-map-alb \
  --query 'LoadBalancers[0].DNSName' --output text)

ALB_ZONE=$(aws elbv2 describe-load-balancers \
  --names proto-pie-map-alb \
  --query 'LoadBalancers[0].CanonicalHostedZoneId' --output text)

# Get your Route 53 hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name yourdomain.com \
  --query 'HostedZones[0].Id' --output text | sed 's|/hostedzone/||')

# Create A-record alias pointing to the ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"yourdomain.com\",
        \"Type\": \"A\",
        \"AliasTarget\": {
          \"HostedZoneId\": \"$ALB_ZONE\",
          \"DNSName\": \"$ALB_DNS\",
          \"EvaluateTargetHealth\": true
        }
      }
    }]
  }"
```

---

## Step 11 — GitHub Actions secrets

In your GitHub repository → **Settings → Secrets and variables → Actions**, add:

| Secret name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key from Step 4 |
| `AWS_SECRET_ACCESS_KEY` | Secret from Step 4 |

The workflow in `.github/workflows/deploy.yml` reads these automatically.

---

## Step 12 — Auto-scaling (optional, recommended)

For a public-facing app, add scaling so one task isn't a single point of failure:

```bash
# Register scalable target (1–4 tasks)
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/proto-pie-map-cluster/proto-pie-map-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 4

# Scale out when CPU > 70%
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/proto-pie-map-cluster/proto-pie-map-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

---

## Ongoing operations

### Roll back a bad deployment
```bash
# List recent deployments
aws ecs describe-services \
  --cluster proto-pie-map-cluster \
  --services proto-pie-map-service \
  --query 'services[0].deployments'

# Force the service back to the previous task definition revision
aws ecs update-service \
  --cluster proto-pie-map-cluster \
  --service proto-pie-map-service \
  --task-definition proto-pie-map-task:<previous-revision>
```

### View live logs
```bash
aws logs tail /ecs/proto-pie-map --follow
```

### Estimated monthly cost (us-east-1, minimal config)

| Resource | Spec | ~Cost/month |
|---|---|---|
| Fargate task | 0.25 vCPU / 0.5 GB, 1 task, 24/7 | ~$9 |
| ALB | 1 LCU average | ~$16 |
| ECR storage | <1 GB images | <$1 |
| CloudWatch Logs | 30-day retention | ~$1 |
| Route 53 | 1 hosted zone | $0.50 |
| ACM certificate | Public cert | Free |
| **Total** | | **~$28/month** |

Costs rise with traffic (ALB LCUs) and scale-out tasks. CloudFront adds ~$1–5/month but
significantly reduces ALB costs for cached static content.
