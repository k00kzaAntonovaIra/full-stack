def test_read_trips(client):
    # Проверяем получение списка (Код 200)
    response = client.get("/trips/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_upload_image_no_auth(client):
    # Проверка безопасности: нельзя грузить фото без токена (Код 401)
    response = client.post("/trips/1/upload-image")
    assert response.status_code == 401

def test_get_non_existent_trip(client):
    # Проверка граничного случая: несуществующая поездка (Код 404)
    response = client.get("/trips/999999")
    assert response.status_code in [404, 401] # Либо не найдено, либо нужен логин