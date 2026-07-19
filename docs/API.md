# API Reference — 0.1.0

Base path: `/api/v1`  
Interactive docs: `/docs`  
OpenAPI JSON: `/docs.json`

## Response envelope

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID",
    "message": "Invalid username or password",
    "requestId": "uuid"
  }
}
```

## Auth

### Login

`POST /auth/login`

```json
{
  "usernameOrEmail": "admin",
  "password": "ChangeMeAdmin!2026",
  "companyCode": "VJGARDEN"
}
```

### Refresh

`POST /auth/refresh`

```json
{ "refreshToken": "..." }
```

### Logout

`POST /auth/logout` — same body as refresh; idempotent.

## Devices

### Register

`POST /devices/register` — requires `device.register`

```json
{
  "deviceUuid": "11111111-1111-4111-8111-111111111111",
  "platform": "ANDROID",
  "deviceName": "Counter Tablet 1",
  "appVersion": "0.22.0"
}
```

### List / Get

`GET /devices?branchId=` — requires `device.view`  
`GET /devices/:id` — requires `device.view`
