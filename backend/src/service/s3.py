import aioboto3
from src.core.settings import settings

class S3Service:
    def __init__(self):
        # Используем данные из настроек
        self.endpoint_url = "http://localhost:9000"
        self.access_key = "minioadmin"
        self.secret_key = "minioadmin"
        self.bucket_name = "trips"

    async def upload_file(self, file_content: bytes, file_name: str, content_type: str):
        session = aioboto3.Session()
        async with session.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key
        ) as s3:
            await s3.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=file_content,
                ContentType=content_type
            )
            # Ссылка, которую сохраним в базу
            return f"{self.endpoint_url}/{self.bucket_name}/{file_name}"

s3_service = S3Service()