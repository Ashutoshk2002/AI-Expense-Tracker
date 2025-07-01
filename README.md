# SpendWiseAI

A serverless AI-powered personal finance management application that provides intelligent budget insights and expense analysis using AWS Lambda, Bedrock, and other AWS services.

## Overview

SpendWiseAI helps users track their expenses and budgets by providing AI-generated insights and recommendations. The application leverages AWS Lambda for serverless computing, AWS Bedrock for AI analysis, and various other AWS services for a complete cloud-native solution.

## Architecture

The entire backend infrastructure is built on AWS Lambda functions, providing a scalable and cost-effective serverless architecture:

```
Frontend → API Gateway → Lambda Function → AWS Bedrock (AI Insights)
                    ↓
                RDS Database ← Lambda Function → SES (Email Service)
```

## Lambda Function Implementation

### Core Backend Architecture

The entire backend is hosted on AWS Lambda functions wrapped in a serverless HTTP framework using Node.js and Express:

- **Serverless HTTP**: Express.js application wrapped with `serverless-http` to handle HTTP requests in Lambda
- **Single Function Architecture**: All API endpoints are handled by a single Lambda function for simplicity
- **Event-Driven Processing**: Lambda functions are triggered by API Gateway events

### Lambda Function Responsibilities

#### 1. API Request Handling
- Receives HTTP requests from the frontend via API Gateway
- Validates incoming data (budget amounts, expense categories, etc.)
- Implements proper error handling and response formatting

#### 2. AWS Bedrock Integration
- Formats financial data for Bedrock AI model consumption
- Sends structured prompts to generate relevant financial insights
- Processes AI responses and extracts actionable recommendations

#### 3. Email Service Management
- Configures SES for transactional email delivery
- Formats AI insights into user-friendly email templates
- Handles email delivery status and error notifications

#### 4. Database Operations
- Establishes secure connections to RDS MySQL/PostgreSQL instance
- Performs CRUD operations for user data, budgets, and expenses
- Implements data aggregation queries for analytics dashboard

#### 5. Business Logic Processing
- Calculates budget vs. actual spending ratios
- Identifies spending patterns and anomalies
- Generates summary statistics for frontend analytics

## Key Features

- **Budget Tracking**: Users can set budgets and track expenses in real-time
- **AI-Powered Insights**: Leverages AWS Bedrock to generate personalized financial insights
- **Email Notifications**: Automated email delivery of insights and reports via SES
- **Data Analytics**: Historical data visualization and trend analysis
- **Serverless Architecture**: Cost-effective and scalable backend infrastructure

## Technology Stack

### Backend (Lambda)
- **Runtime**: Node.js 22.x
- **Framework**: Express.js with serverless-http wrapper
- **Database**: AWS RDS (MySQL)
- **AI Service**: AWS Bedrock (Amazon Titan models)
- **Email Service**: AWS SES
- **API Gateway**: REST API with Lambda proxy integration

### Frontend
- Modern JavaScript framework (React/Vue/Angular)
- API integration with Lambda endpoints
- Interactive budget and expense entry forms
- Analytics dashboard with charts and visualizations

## AWS Services Integration

### AWS Lambda Benefits
- **Cost Efficiency**: Pay only for compute time used
- **Auto Scaling**: Automatically handles traffic spikes
- **Zero Server Management**: No infrastructure maintenance required
- **High Availability**: Built-in fault tolerance and redundancy

### AWS Bedrock Integration
- Utilizes foundation models for financial analysis
- Generates personalized spending recommendations
- Provides natural language insights about financial patterns
- Offers budget optimization suggestions

### AWS SES Implementation
- Sends formatted email reports with AI insights
- Handles bounce and complaint notifications
- Provides delivery status tracking
- Supports both HTML and plain text email formats

### AWS RDS Data Storage
- Persistent storage for user financial data
- Supports complex queries for analytics
- Automated backups and point-in-time recovery
- Scalable storage based on usage patterns
