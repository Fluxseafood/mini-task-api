openapi: 3.0.0
info:
  title: mini-task
  version: 1.0.0
  description: ''
servers:
  - url: http://localhost:3000
paths:
  /api/v1/auth/login:
    post:
      summary: login
      tags:
        - Auth Endpoints
      responses: {}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
  /api/v1/auth/register:
    post:
      summary: register
      tags:
        - Auth Endpoints
      responses: {}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                name:
                  type: string
  /api/v1/auth/refresh:
    post:
      summary: auth-refresh
      tags:
        - Auth Endpoints
      responses: {}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                refreshToken:
                  type: string
  /api/v1/auth/logout:
    post:
      summary: logout
      tags:
        - Auth Endpoints
      responses: {}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                refreshToken:
                  type: string
  /api/v1/tasks:
    get:
      summary: get-task
      tags:
        - User Endpoints
      responses: {}
      security:
        - BearerAuth: []
    post:
      summary: POST /tasks รับ Idempotency-Key
      tags:
        - Idempotency
      parameters:
        - name: Idempotency-Key
          in: header
          schema:
            type: string
      responses: {}
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                priority:
                  type: string
  /api/v1/users/me:
    get:
      summary: ดูข้อมูลตัวเอง
      tags:
        - User Endpoints
      responses: {}
      security:
        - BearerAuth: []
    put:
      summary: แก้ไขข้อมูลตัวเอง
      tags:
        - User Endpoints
      responses: {}
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
  /api/v2/tasks:
    post:
      summary: สร้าง task
      tags:
        - User Endpoints
      responses: {}
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                priority:
                  type: string
                assignedTo:
                  nullable: true
                isPublic:
                  type: boolean
  /api/v1/users:
    get:
      summary: admin only - list users
      tags:
        - User Endpoints
      responses: {}
      security:
        - BearerAuth: []
  /api/v1/tasks/3:
    get:
      summary: ดูรายละเอียด
      tags:
        - Task Endpoints (v1)
      responses: {}
      security:
        - BearerAuth: []
  /api/test/anonymous-test:
    get:
      summary: Anonymous
      tags:
        - Rate Limitin
      responses: {}
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
