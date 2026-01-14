# AWS ECS Deployment Guide

This guide will help you deploy the Aeronomy SAF Marketplace application to AWS ECS (Elastic Container Service) using Fargate.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **ECR Repository** created for storing Docker images
5. **VPC, Subnets, and Security Groups** configured
6. **Application Load Balancer** (optional, but recommended)
7. **Secrets Manager** or **Parameter Store** for environment variables

## Architecture Overview

```
Internet → ALB → ECS Service (Fargate) → Application (Port 3004)
                           ↓
                    Secrets Manager (for env vars)
                           ↓
                    CloudWatch Logs
                           ↓
                    MongoDB Atlas
```

## Step 1: Create ECR Repository

1. Go to AWS Console → ECR (Elastic Container Registry)
2. Create a new repository named `aeronomy-saf-marketplace`
3. Note the repository URI (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/aeronomy-saf-marketplace`)

### Authenticate Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

## Step 2: Build and Push Docker Image

### Build the image locally:

```bash
docker build -t aeronomy-saf-marketplace .
```

### Tag the image:

```bash
docker tag aeronomy-saf-marketplace:latest YOUR_ECR_REPO_URI:latest
```

### Push to ECR:

```bash
docker push YOUR_ECR_REPO_URI:latest
```

**Note:** Replace `YOUR_ECR_REPO_URI` with your actual ECR repository URI.

## Step 3: Store Secrets in AWS Secrets Manager

For security, store sensitive environment variables in AWS Secrets Manager:

```bash
# Clerk Publishable Key
aws secretsmanager create-secret \
  --name clerk/publishable-key \
  --secret-string "pk_test_..." \
  --region us-east-1

# Clerk Secret Key
aws secretsmanager create-secret \
  --name clerk/secret-key \
  --secret-string "sk_test_..." \
  --region us-east-1

# MongoDB URI
aws secretsmanager create-secret \
  --name mongodb/uri \
  --secret-string "mongodb+srv://..." \
  --region us-east-1

# Resend API Key
aws secretsmanager create-secret \
  --name resend/api-key \
  --secret-string "re_..." \
  --region us-east-1
```

### Alternative: Use AWS Systems Manager Parameter Store

```bash
aws ssm put-parameter \
  --name "/aeronomy/clerk/publishable-key" \
  --value "pk_test_..." \
  --type "SecureString" \
  --region us-east-1

aws ssm put-parameter \
  --name "/aeronomy/clerk/secret-key" \
  --value "sk_test_..." \
  --type "SecureString" \
  --region us-east-1

aws ssm put-parameter \
  --name "/aeronomy/mongodb/uri" \
  --value "mongodb+srv://..." \
  --type "SecureString" \
  --region us-east-1

aws ssm put-parameter \
  --name "/aeronomy/resend/api-key" \
  --value "re_..." \
  --type "SecureString" \
  --region us-east-1
```

## Step 4: Create IAM Roles

### ECS Task Execution Role

Create a role named `ecsTaskExecutionRole` with the managed policy `AmazonECSTaskExecutionRolePolicy`. Additionally, grant permissions to access Secrets Manager:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:*:secret:clerk/*",
        "arn:aws:secretsmanager:*:*:secret:mongodb/*",
        "arn:aws:secretsmanager:*:*:secret:resend/*"
      ]
    }
  ]
}
```

### ECS Task Role (Optional)

Create a role named `ecsTaskRole` if your application needs to access other AWS services (S3, SQS, etc.).

## Step 5: Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/aeronomy-saf-marketplace \
  --region us-east-1
```

## Step 6: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name aeronomy-cluster \
  --region us-east-1
```

Or use the AWS Console:
1. Go to ECS → Clusters
2. Click "Create Cluster"
3. Select "AWS Fargate (serverless)"
4. Name it `aeronomy-cluster`

## Step 7: Create Task Definition

1. Update `ecs-task-definition.json` with your actual values:
   - Replace `YOUR_ACCOUNT_ID` with your AWS account ID
   - Replace `YOUR_ECR_REPO_URI` with your ECR repository URI
   - Update `REGION` with your AWS region
   - Update secret ARNs with your actual secret ARNs

2. Register the task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region us-east-1
```

Or use the AWS Console:
1. Go to ECS → Task Definitions → Create new Task Definition
2. Select "Fargate"
3. Fill in the details from `ecs-task-definition.json`

## Step 8: Create Application Load Balancer (Recommended)

### Create Target Group

```bash
aws elbv2 create-target-group \
  --name aeronomy-tg \
  --protocol HTTP \
  --port 3004 \
  --vpc-id vpc-xxxxxxxxx \
  --target-type ip \
  --health-check-path /api/health/mongodb \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region us-east-1
```

### Create Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name aeronomy-alb \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx \
  --scheme internet-facing \
  --type application \
  --region us-east-1
```

### Create Listener

```bash
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:REGION:ACCOUNT_ID:loadbalancer/app/aeronomy-alb/xxxxxxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT_ID:targetgroup/aeronomy-tg/xxxxxxxxx \
  --region us-east-1
```

**For HTTPS (Recommended):**
1. Request an ACM certificate for your domain
2. Create an HTTPS listener (port 443) with the certificate

## Step 9: Create Security Group

Create a security group that allows:
- **Inbound:** Port 3004 from ALB security group (or from internet if no ALB)
- **Outbound:** All traffic (or specific ports as needed)

```bash
aws ec2 create-security-group \
  --group-name aeronomy-ecs-sg \
  --description "Security group for Aeronomy ECS tasks" \
  --vpc-id vpc-xxxxxxxxx \
  --region us-east-1

# Allow inbound from ALB (replace sg-alb with your ALB security group)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3004 \
  --source-group sg-alb \
  --region us-east-1
```

## Step 10: Create ECS Service

1. Update `ecs-service-definition.json` with your actual values:
   - Replace subnet IDs
   - Replace security group ID
   - Replace target group ARN
   - Update region and account ID

2. Create the service:

```bash
aws ecs create-service \
  --cli-input-json file://ecs-service-definition.json \
  --region us-east-1
```

Or use the AWS Console:
1. Go to ECS → Clusters → `aeronomy-cluster`
2. Click "Services" tab → "Create"
3. Fill in the details from `ecs-service-definition.json`

## Step 11: Verify Deployment

1. Check ECS service status:
```bash
aws ecs describe-services \
  --cluster aeronomy-cluster \
  --services aeronomy-saf-marketplace-service \
  --region us-east-1
```

2. Check task status:
```bash
aws ecs list-tasks \
  --cluster aeronomy-cluster \
  --service-name aeronomy-saf-marketplace-service \
  --region us-east-1
```

3. View logs:
```bash
aws logs tail /ecs/aeronomy-saf-marketplace --follow --region us-east-1
```

4. Access the application:
   - If using ALB: Use the ALB DNS name
   - If not using ALB: Use the public IP of the ECS task

## Step 12: Set Up Custom Domain (Optional)

1. Point your domain's DNS to the ALB DNS name (or use Route 53)
2. Update Clerk dashboard with your production domain
3. Update environment variables if needed

## CI/CD Pipeline (GitHub Actions)

See `github-workflows/deploy-ecs.yml` for an automated deployment pipeline.

## Environment Variables Reference

### Required Environment Variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `MONGODB_URI` - MongoDB Atlas connection string
- `RESEND_API_KEY` - Resend API key for emails

### Optional Environment Variables:

- `PRODUCER_DASHBOARD_WEBHOOK_URL` - Webhook URL for producer dashboard
- `PRODUCER_DASHBOARD_WEBHOOK_SECRET` - Webhook secret
- `BUYER_DASHBOARD_URL` - Buyer dashboard URL
- `PRODUCER_API_KEY` - API key for external API access

## Monitoring and Logging

### CloudWatch Logs

Logs are automatically sent to CloudWatch:
- Log Group: `/ecs/aeronomy-saf-marketplace`
- Stream Prefix: `ecs`

### Health Checks

The application exposes a health check endpoint:
- `/api/health/mongodb` - Checks MongoDB connection

### Metrics

Monitor:
- CPU and Memory utilization
- Task count and status
- Request count and latency (if using ALB)
- Error rates

## Scaling

### Manual Scaling

Update desired count:
```bash
aws ecs update-service \
  --cluster aeronomy-cluster \
  --service aeronomy-saf-marketplace-service \
  --desired-count 4 \
  --region us-east-1
```

### Auto Scaling

Create an Auto Scaling target:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/aeronomy-cluster/aeronomy-saf-marketplace-service \
  --min-capacity 2 \
  --max-capacity 10 \
  --region us-east-1
```

Create scaling policy:
```bash
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/aeronomy-cluster/aeronomy-saf-marketplace-service \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }' \
  --region us-east-1
```

## Troubleshooting

### Tasks not starting

1. Check CloudWatch Logs for errors
2. Verify security group allows inbound traffic
3. Verify task has internet access (if using public subnets or NAT gateway)
4. Check Secrets Manager permissions for execution role

### Health checks failing

1. Verify health check endpoint is accessible
2. Check application logs
3. Verify MongoDB connection
4. Increase health check grace period if startup is slow

### Connection issues

1. Verify MongoDB Atlas network access (whitelist ECS IPs or use 0.0.0.0/0)
2. Check security groups and network ACLs
3. Verify DNS resolution

## Cost Optimization

- Use Fargate Spot for non-production environments (save up to 70%)
- Right-size CPU and memory based on actual usage
- Use CloudWatch Insights to analyze logs efficiently
- Consider Reserved Capacity for predictable workloads

## Security Best Practices

1. **Never commit secrets** - Use Secrets Manager or Parameter Store
2. **Use HTTPS** - Terminate SSL at the ALB
3. **Network isolation** - Use private subnets with NAT gateway
4. **Least privilege** - Grant minimal IAM permissions
5. **Regular updates** - Keep Docker images and dependencies updated
6. **WAF** - Consider AWS WAF for DDoS protection

## Cleanup

To delete all resources:

```bash
# Stop service
aws ecs update-service \
  --cluster aeronomy-cluster \
  --service aeronomy-saf-marketplace-service \
  --desired-count 0 \
  --region us-east-1

# Delete service
aws ecs delete-service \
  --cluster aeronomy-cluster \
  --service aeronomy-saf-marketplace-service \
  --region us-east-1

# Deregister task definition
aws ecs deregister-task-definition \
  --task-definition aeronomy-saf-marketplace:1 \
  --region us-east-1

# Delete cluster
aws ecs delete-cluster \
  --cluster aeronomy-cluster \
  --region us-east-1
```

## Support

For issues or questions:
- Check AWS ECS documentation: https://docs.aws.amazon.com/ecs/
- Check application logs in CloudWatch
- Review this deployment guide





