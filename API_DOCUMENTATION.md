# Farm & Give - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "farmer123",
  "email": "farmer@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "farmer123",
    "email": "farmer@example.com",
    "selectedCharacter": null
  }
}
```

---

### Login User
**POST** `/auth/login`

Authenticate existing user.

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "farmer123",
    "email": "farmer@example.com",
    "selectedCharacter": "sunny",
    "gameProgress": {
      "level": 5,
      "coins": 250,
      "experience": 120
    }
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "farmer123",
  "email": "farmer@example.com",
  "selectedCharacter": "sunny",
  "gameProgress": {
    "level": 5,
    "coins": 250,
    "experience": 120,
    "unlockedAreas": ["starter_farm"],
    "inventory": [
      { "itemId": "carrot_seeds", "quantity": 10 }
    ],
    "farm": {
      "plots": []
    }
  },
  "selectedCharity": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Brooklyn Grange"
  },
  "totalSpent": 50.00,
  "charityContribution": 5.00
}
```

---

## Game Endpoints

### Get All Characters
**GET** `/game/characters`

Get list of all playable characters.

**Response:**
```json
[
  {
    "id": "sunny",
    "name": "Sunny",
    "description": "The optimistic farmer who brings sunshine to every harvest",
    "color": "#FFD700",
    "bonus": "crops_grow_10_percent_faster"
  },
  {
    "id": "luna",
    "name": "Luna",
    "description": "The night gardener who tends to moonlit crops",
    "color": "#9370DB",
    "bonus": "night_crops_yield_double"
  }
]
```

---

### Select Character
**POST** `/game/select-character`

Choose a character for the user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "characterId": "sunny"
}
```

**Response:**
```json
{
  "message": "Character selected successfully",
  "character": {
    "id": "sunny",
    "name": "Sunny",
    "description": "The optimistic farmer who brings sunshine to every harvest",
    "color": "#FFD700",
    "bonus": "crops_grow_10_percent_faster"
  }
}
```

---

### Save Game Progress
**POST** `/game/save`

Save current game state.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "gameProgress": {
    "level": 5,
    "coins": 250,
    "experience": 120,
    "inventory": [
      { "itemId": "carrot_seeds", "quantity": 10 }
    ],
    "farm": {
      "plots": [
        {
          "x": 5,
          "y": 5,
          "crop": "carrot",
          "plantedAt": "2024-01-15T10:30:00Z",
          "wateredAt": "2024-01-15T10:35:00Z",
          "stage": 2
        }
      ]
    },
    "unlockedAreas": ["starter_farm"]
  }
}
```

**Response:**
```json
{
  "message": "Game saved successfully",
  "gameProgress": { /* saved progress */ }
}
```

---

### Load Game Progress
**GET** `/game/load`

Load saved game state.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "gameProgress": {
    "level": 5,
    "coins": 250,
    "experience": 120,
    "inventory": [],
    "farm": { "plots": [] },
    "unlockedAreas": ["starter_farm"]
  },
  "selectedCharacter": "sunny",
  "character": {
    "id": "sunny",
    "name": "Sunny"
  }
}
```

---

## Charity Endpoints

### Get All Charities
**GET** `/charity/organizations`

Get list of verified community gardens and farms.

**Query Parameters:**
- `city` (optional) - Filter by city
- `state` (optional) - Filter by state
- `type` (optional) - Filter by type (community_garden, urban_farm, agricultural_initiative)

**Example:**
```
GET /charity/organizations?city=Brooklyn&state=NY
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Brooklyn Grange",
    "type": "urban_farm",
    "description": "The world's largest rooftop soil farms",
    "location": {
      "address": "37-18 Northern Blvd",
      "city": "Long Island City",
      "state": "NY",
      "zipCode": "11101",
      "country": "USA"
    },
    "contact": {
      "email": "info@brooklyngrangefarm.com",
      "website": "https://www.brooklyngrangefarm.com"
    },
    "verified": true,
    "totalReceived": 1250.50,
    "supporters": 45
  }
]
```

---

### Get Single Charity
**GET** `/charity/:id`

Get details of a specific charity.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Brooklyn Grange",
  "type": "urban_farm",
  "description": "The world's largest rooftop soil farms",
  "location": { /* location details */ },
  "contact": { /* contact details */ },
  "verified": true,
  "totalReceived": 1250.50,
  "supporters": 45
}
```

---

### Select Charity
**POST** `/charity/select`

Choose which charity to support.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "charityId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "message": "Charity selected successfully",
  "charity": { /* charity details */ }
}
```

---

### Get Impact Statistics
**GET** `/charity/stats/impact`

Get overall charity impact statistics.

**Response:**
```json
{
  "totalDonated": 15000.00,
  "totalCharities": 10,
  "totalSupporters": 250,
  "topCharities": [
    {
      "name": "Brooklyn Grange",
      "totalReceived": 2500.00,
      "supporters": 50,
      "location": {
        "city": "Long Island City",
        "state": "NY"
      }
    }
  ]
}
```

---

### Get My Impact
**GET** `/charity/my-impact`

Get user's personal charity contributions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalContributed": 25.50,
  "selectedCharity": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Brooklyn Grange"
  },
  "transactionCount": 5,
  "recentTransactions": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "amount": 10.00,
      "charityAmount": 1.00,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Payment Endpoints

### Create Payment Intent
**POST** `/payments/create-intent`

Create a Stripe payment intent for in-game purchase.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 1000,
  "items": [
    {
      "itemId": "carrot_seeds",
      "itemName": "Carrot Seeds",
      "quantity": 10,
      "price": 10
    }
  ]
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefg",
  "transactionId": "507f1f77bcf86cd799439014"
}
```

---

### Confirm Payment
**POST** `/payments/confirm`

Confirm successful payment and update user account.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "transactionId": "507f1f77bcf86cd799439014",
  "paymentIntentId": "pi_1234567890"
}
```

**Response:**
```json
{
  "message": "Payment confirmed successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439014",
    "amount": 10.00,
    "charityAmount": 1.00,
    "status": "completed"
  },
  "charityContribution": 1.00
}
```

---

### Get Payment History
**GET** `/payments/history`

Get user's transaction history.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "type": "purchase",
    "amount": 10.00,
    "charityAmount": 1.00,
    "charity": {
      "name": "Brooklyn Grange"
    },
    "status": "completed",
    "description": "In-game purchase",
    "metadata": {
      "itemsPurchased": [
        {
          "itemId": "carrot_seeds",
          "itemName": "Carrot Seeds",
          "quantity": 10,
          "price": 10
        }
      ]
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Response
```json
{
  "error": "Invalid credentials"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

---

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Characters:**
```bash
curl http://localhost:5000/api/game/characters
```

**Get Charities:**
```bash
curl http://localhost:5000/api/charity/organizations
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:5000/api`
3. For authenticated requests, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

---

## WebSocket Support (Future)

Planned for multiplayer features:
- Real-time farm updates
- Chat system
- Live events
- Friend notifications

---

## Versioning

Current version: **v1.0**

Future versions will be accessible via:
```
/api/v2/...
```

---

## Support

For API issues or questions:
- Check server logs
- Review error messages
- Consult SETUP.md for configuration help
