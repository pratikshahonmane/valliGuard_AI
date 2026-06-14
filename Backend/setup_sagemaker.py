#!/usr/bin/env python3
"""
SageMaker Endpoint Configuration & Test Script
Helps setup and verify SageMaker endpoint integration with ValliGuard API
"""

import os
import sys
import json
import boto3
from datetime import datetime

def print_header(title):
    """Print a formatted header."""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")

def check_aws_credentials():
    """Check if AWS credentials are configured."""
    print_header("✓ Checking AWS Credentials")
    
    try:
        sts = boto3.client('sts')
        response = sts.get_caller_identity()
        
        print(f"✅ AWS Account ID: {response['Account']}")
        print(f"✅ AWS User ARN: {response['Arn']}")
        print(f"✅ Credentials are valid\n")
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\nSetup AWS credentials:")
        print("  1. Run: aws configure")
        print("  2. Or set environment variables:")
        print("     export AWS_ACCESS_KEY_ID=your_key")
        print("     export AWS_SECRET_ACCESS_KEY=your_secret\n")
        return False

def list_sagemaker_endpoints():
    """List all available SageMaker endpoints."""
    print_header("📋 Available SageMaker Endpoints")
    
    try:
        region = os.getenv("AWS_REGION", "ap-south-1")
        sm = boto3.client('sagemaker', region_name=region)
        response = sm.list_endpoints()
        
        if not response['Endpoints']:
            print("No endpoints found in region:", region)
            return None
        
        print(f"Found {len(response['Endpoints'])} endpoint(s) in {region}:\n")
        
        for ep in response['Endpoints']:
            status_symbol = "🟢" if ep['EndpointStatus'] == 'InService' else "🔴"
            print(f"{status_symbol} Name: {ep['EndpointName']}")
            print(f"   Status: {ep['EndpointStatus']}")
            print(f"   Created: {ep['CreationTime']}")
            if 'LastModifiedTime' in ep:
                print(f"   Updated: {ep['LastModifiedTime']}")
            print()
        
        return response['Endpoints']
    except Exception as e:
        print(f"❌ Error: {str(e)}\n")
        return None

def test_endpoint(endpoint_name):
    """Test prediction on a SageMaker endpoint."""
    print_header(f"🧪 Testing Endpoint: {endpoint_name}")
    
    try:
        from sagemaker.predictor import Predictor
        from sagemaker.serializers import CSVSerializer
        
        region = os.getenv("AWS_REGION", "ap-south-1")
        
        predictor = Predictor(
            endpoint_name=endpoint_name,
            sagemaker_session=None,
            serializer=CSVSerializer()
        )
        
        print(f"✅ Connected to endpoint\n")
        
        # Test with sample data
        sample_features = "1,1,10000.0,50000.0,40000.0,0.0,10000.0,10000.0,10000.0,0.2,0,0,0,0"
        
        print(f"📤 Sending test prediction...")
        print(f"   Features: {sample_features}\n")
        
        result = predictor.predict(sample_features)
        
        if isinstance(result, bytes):
            result = result.decode('utf-8')
        
        fraud_prob = float(result.strip())
        
        print(f"✅ Prediction successful!")
        print(f"   Fraud Probability: {fraud_prob:.4f}")
        print(f"   Prediction: {'FRAUD' if fraud_prob >= 0.5 else 'LEGITIMATE'}\n")
        
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}\n")
        return False

def setup_environment():
    """Interactive setup wizard."""
    print_header("⚙️  SageMaker Environment Setup")
    
    print("This wizard will help you configure SageMaker endpoint integration.\n")
    
    # Check credentials
    if not check_aws_credentials():
        print("❌ Cannot proceed without AWS credentials\n")
        return False
    
    # List endpoints
    endpoints = list_sagemaker_endpoints()
    
    if not endpoints:
        print("⚠️  No endpoints found. Please deploy a model first.\n")
        return False
    
    # Select endpoint
    print("Select an endpoint to configure:\n")
    for i, ep in enumerate(endpoints, 1):
        print(f"{i}. {ep['EndpointName']} ({ep['EndpointStatus']})")
    
    try:
        choice = int(input("\nEnter number (or 0 to skip): "))
        if choice == 0:
            return True
        if choice < 1 or choice > len(endpoints):
            print("Invalid choice\n")
            return False
        
        selected = endpoints[choice - 1]
        endpoint_name = selected['EndpointName']
        
        # Test endpoint
        if test_endpoint(endpoint_name):
            # Create .env file
            print_header("💾 Saving Configuration")
            
            env_content = f"""# ValliGuard SageMaker Configuration
# Generated: {datetime.now().isoformat()}

USE_SAGEMAKER=true
SAGEMAKER_ENDPOINT_NAME={endpoint_name}
AWS_REGION={os.getenv('AWS_REGION', 'ap-south-1')}
"""
            
            with open('.env', 'w') as f:
                f.write(env_content)
            
            print(f"✅ Configuration saved to .env")
            print(f"\nTo use this configuration:")
            print(f"  python main.py\n")
            
            return True
        else:
            print("❌ Endpoint test failed\n")
            return False
            
    except ValueError:
        print("Invalid input\n")
        return False
    except Exception as e:
        print(f"Error: {str(e)}\n")
        return False

def main():
    """Main function."""
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║    ValliGuard API - SageMaker Integration Setup            ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "check":
            check_aws_credentials()
            list_sagemaker_endpoints()
        
        elif command == "test":
            if len(sys.argv) < 3:
                print("Usage: python setup_sagemaker.py test <endpoint_name>\n")
                list_sagemaker_endpoints()
            else:
                endpoint = sys.argv[2]
                test_endpoint(endpoint)
        
        elif command == "setup":
            setup_environment()
        
        elif command == "list":
            list_sagemaker_endpoints()
        
        else:
            print(f"Unknown command: {command}\n")
            print_help()
    else:
        print_help()

def print_help():
    """Print help message."""
    print("""
Usage:
  python setup_sagemaker.py [command] [options]

Commands:
  check              - Check AWS credentials and list endpoints
  list               - List all SageMaker endpoints
  test <endpoint>    - Test a specific endpoint
  setup              - Interactive setup wizard
  help               - Show this help message

Examples:
  python setup_sagemaker.py check
  python setup_sagemaker.py list
  python setup_sagemaker.py test paysim-xgb-2026-06-04-17-31-22-321
  python setup_sagemaker.py setup

For more information, see SAGEMAKER_INTEGRATION.md
""")

if __name__ == "__main__":
    main()
