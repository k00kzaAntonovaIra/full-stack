import aioboto3
import json
from src.core.settings import settings

class S3Service:
    async def upload_file(self, file_content: bytes, file_name: str, content_type: str):
        try:
            session = aioboto3.Session()
            async with session.client(
                's3',
                endpoint_url="http://storage:9000",
                aws_access_key_id="minioadmin",
                aws_secret_access_key="minioadmin",
                region_name="us-east-1"
            ) as s3:
                # 1. Создаем бакет
                try:
                    await s3.create_bucket(Bucket="travel-photos")
                except:
                    pass

                # 2. Ставим политику (чтобы бакет стал публичным САМ)
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Sid": "PublicRead",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::travel-photos/*"]
                    }]
                }
                await s3.put_bucket_policy(Bucket="travel-photos", Policy=json.dumps(policy))

                # 3. Загружаем файл
                await s3.put_object(
                    Bucket="travel-photos",
                    Key=file_name,
                    Body=file_content,
                    ContentType=content_type
                )
                
                return f"http://localhost:9000/travel-photos/{file_name}"
        except Exception as e:
            print(f"!!! ОШИБКА ВНУТРИ S3: {e}")
            raise e
s3_service = S3Service()