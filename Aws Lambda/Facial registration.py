
import boto3
import json
import re
import urllib.parse
from botocore.exceptions import ClientError

AWS_REGION = "ap-south-1"
s3 = boto3.client('s3', region_name=AWS_REGION)
rekognition = boto3.client('rekognition', region_name=AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)


EMPLOYEE_TABLE_NAME = "Employeee"  
REKOGNITION_COLLECTION_ID = "employees"
employeeTable = dynamodb.Table(EMPLOYEE_TABLE_NAME)

def lambda_handler(event, context):
    try:
        print("Event Received:\n", json.dumps(event, indent=2))
        records = event.get("Records", [])

        if not records:
            print(" No records found in event.")
            return {"status": "error", "message": "No records found"}

        for record in records:
            bucket = record.get("s3", {}).get("bucket", {}).get("name")
            key = urllib.parse.unquote_plus(record.get("s3", {}).get("object", {}).get("key", ""))

            if not bucket or not key:
                print(" Bucket or key missing in record.")
                continue

            print(f"📸 Image Uploaded - Bucket: {bucket}, Key: {key}")

            # 1. Index face
            rekog_response = index_employee_image(bucket, key)
            print(" Rekognition Response:\n", json.dumps(rekog_response, indent=2))

            face_records = rekog_response.get("FaceRecords", [])
            if not face_records:
                print("⚠ No face detected. Skipping database entry.")
                continue

            faceId = face_records[0]['Face']['FaceId']
            print(f" Detected Face ID: {faceId}")

            # 2. Parse user info from filename
            firstName, lastName, email = parse_user_info_from_filename(key)
            print(f"👤 Parsed Info - FirstName: {firstName}, LastName: {lastName}, Email: {email}")

            # 3. Register in DynamoDB
            register_employee(faceId, firstName, lastName, email)

        return {"status": "success"}

    except Exception as e:
        print("Lambda Error:", str(e))
        return {"status": "error", "message": str(e)}

def index_employee_image(bucket, key):
    try:
      
        sanitized_id = re.sub(r'[^a-zA-Z0-9_.\-:]', '_', key)

        return rekognition.index_faces(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            CollectionId=REKOGNITION_COLLECTION_ID,
            ExternalImageId=sanitized_id,
            MaxFaces=1,
            QualityFilter="AUTO",
            DetectionAttributes=['DEFAULT']
        )
    except Exception as e:
        print(" Rekognition Error:", str(e))
        return {"FaceRecords": []}

def parse_user_info_from_filename(key):
    base_name = key.split('/')[-1].rsplit('.', 1)[0]
    match = re.match(r'^([^-_]+)[-_]([^-_]+)[-_](.+)$', base_name)

    if match:
        firstName = match.group(1)
        lastName = match.group(2)
        email = match.group(3)
    else:
        print(f"⚠ Failed to parse user info from filename: {key}")
        firstName = "Unknown"
        lastName = "Unknown"
        email = "unknown@example.com"

    return firstName, lastName, email

def register_employee(faceId, firstName, lastName, email):
    if not faceId:
        print("⚠ No valid Face ID. Skipping DB entry.")
        return

    try:
        response = employeeTable.put_item(
            Item={
                'rekognitionid': faceId,
                'firstName': firstName,
                'lastName': lastName,
                'email': email
            },
            ConditionExpression='attribute_not_exists(rekognitionid)'          
        print(" DynamoDB Entry Added:", json.dumps(response, indent=2))
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            print(f"⚠ Duplicate Rekognition ID detected: {faceId}. Skipping insert.")
        else:
            print("DynamoDB Error:", str(e))
