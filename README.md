#  Cloth Store — Full Stack Web Application

A full-stack clothing store web application built with **Django REST Framework** (backend) and **React + Vite** (frontend), using **MySQL** as the database.

---

##  Project Structure

```
Cloth_Store_Project/
├── backend/                        # Django REST API
│   ├── apps/
│   │   ├── users/                  # Authentication, user management
│   │   ├── products/               # Products, categories, variants
│   │   ├── orders/                 # Orders, order items
│   │   └── dashboard/              # Admin & Sale staff analytics
│   ├── cloth_store/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── media/
│   │   └── products/               # Uploaded product images
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── api/                    # Axios API calls
│   │   ├── context/                # Auth & Cart global state
│   │   ├── components/             # Reusable UI components
│   │   └── pages/                  # All page components
│   ├── package.json
│   └── vite.config.js
│
└── venv/                           # Python virtual environment
```

---

##  Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 18, Vite, Tailwind CSS      |
| Backend        | Django 6, Django REST Framework   |
| Database       | MySQL 8                           |
| Auth           | JWT (custom implementation)       |
| Password Hash  | bcrypt                            |
| HTTP Client    | Axios                             |
| State          | React Context API                 |

---

##  User Roles

| Role     | Access                                                      |
|----------|-------------------------------------------------------------|
| Admin    | Full access — manage products, orders, users, dashboard     |
| Sale     | View & update orders, view low stock alerts                 |
| Customer | Browse products, add to cart, place orders, view history    |

---

##  Database Schema

| Table             | Description                              |
|-------------------|------------------------------------------|
| `Categories`      | Product categories (Shirt, Pants, etc.)  |
| `Products`        | Master product records                   |
| `Product_Variants`| Size + color combinations with stock     |
| `Users`           | All website users with roles             |
| `Orders`          | Customer orders with status tracking     |
| `Order_Items`     | Individual items within each order       |

---

##  Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cloth-store.git
cd cloth-store
```

---

### 2. Database Setup

Open MySQL and run:
```bash
mysql -u root -p < Project_Test.sql
```

Or manually import `Project_Test.sql` using MySQL Workbench.

Then create the admin website user:
```bash
# Generate bcrypt hash
cd backend
python -c "import bcrypt; print(bcrypt.hashpw('Admin@1234'.encode(), bcrypt.gensalt()).decode())"
```

Copy the hash and run in MySQL:
```sql
USE Cloth_Store;

INSERT INTO Users (name, email, password, role, status)
VALUES ('Admin', 'admin@clothstore.com', '<paste_hash_here>', 'Admin', 'Active');

INSERT INTO Categories (name)
VALUES ('Shirt'), ('Pants'), ('Dress'), ('Jacket'), ('Accessories');
```

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env           # then edit with your DB credentials
```


```bash
# Start Django server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

---

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 5. Product Images

Place product images in:
```
backend/media/products/
```

Use URL format in the Image URL field:
```
/media/products/your-image.webp
```

>  No spaces in filenames — use hyphens instead: `my-product.webp`

---

##  Default Login Credentials

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@clothstore.com     | Admin@1234   |

>  Change these credentials before deploying to production.

---

##  API Endpoints

### Authentication
| Method | Endpoint                  | Access   | Description          |
|--------|---------------------------|----------|----------------------|
| POST   | `/api/auth/register/`     | Public   | Register customer    |
| POST   | `/api/auth/login/`        | Public   | Login, get JWT token |
| POST   | `/api/auth/token/refresh/`| Public   | Refresh access token |
| GET    | `/api/auth/profile/`      | Any user | Get own profile      |

### Products
| Method | Endpoint                        | Access          | Description            |
|--------|---------------------------------|-----------------|------------------------|
| GET    | `/api/products/`                | Public          | List all products      |
| GET    | `/api/products/?category=Shirt` | Public          | Filter by category     |
| GET    | `/api/products/?search=cotton`  | Public          | Search products        |
| GET    | `/api/products/<id>/`           | Public          | Product detail         |
| POST   | `/api/products/`                | Admin           | Create product         |
| PUT    | `/api/products/<id>/`           | Admin           | Update product         |
| DELETE | `/api/products/<id>/`           | Admin           | Deactivate product     |
| GET    | `/api/categories/`              | Public          | List categories        |
| POST   | `/api/products/<id>/variants/`  | Admin           | Add variant            |
| PUT    | `/api/variants/<id>/`           | Admin           | Update variant         |

### Orders
| Method | Endpoint                    | Access        | Description            |
|--------|-----------------------------|---------------|------------------------|
| POST   | `/api/orders/`              | Customer      | Place new order        |
| GET    | `/api/orders/my/`           | Customer      | Own order history      |
| GET    | `/api/orders/`              | Admin / Sale  | All orders             |
| PATCH  | `/api/orders/<id>/status/`  | Admin / Sale  | Update order status    |

### Dashboard
| Method | Endpoint                           | Access  | Description            |
|--------|------------------------------------|---------|------------------------|
| GET    | `/api/dashboard/summary/`          | Admin   | Revenue & stats        |
| GET    | `/api/dashboard/low-stock/`        | Admin / Sale | Low stock alerts  |
| GET    | `/api/dashboard/recent-orders/`    | Admin / Sale | Latest orders     |
| GET    | `/api/dashboard/sales-by-category/`| Admin   | Sales per category     |

---

##  Order Status Flow

```
Pending → Paid → Processing → Shipped → Delivered
   ↓         ↓         ↓          ↓
Cancelled Cancelled Cancelled  (final)
```

---

##  Pages

| Page              | URL           | Access        |
|-------------------|---------------|---------------|
| Home / Shop       | `/`           | Public        |
| Product Detail    | `/product/:id`| Public        |
| Login             | `/login`      | Public        |
| Register          | `/register`   | Public        |
| Cart              | `/cart`       | Customer      |
| Checkout          | `/checkout`   | Customer      |
| Order History     | `/orders`     | Customer      |
| Admin Dashboard   | `/admin`      | Admin         |
| Sale Dashboard    | `/sale`       | Admin / Sale  |

---

##  Security Notes

- Passwords are hashed with **bcrypt** — never stored in plain text
- JWT access tokens expire after **1 hour**
- JWT refresh tokens expire after **7 days**
- Stock deduction is protected by both **Python transaction locks** and **MySQL triggers**
- Role-based access is enforced on every API endpoint

---

##  requirements.txt

```
django>=6.0
djangorestframework>=3.15
django-cors-headers>=4.3
mysqlclient>=2.2
bcrypt>=4.1
PyJWT>=2.8
python-decouple>=3.8
Pillow>=10.3
```

---

##  Common Issues

| Problem | Solution |
|---|---|
| `No module named 'mysqlclient'` | `pip install mysqlclient` |
| `'User' has no attribute 'is_authenticated'` | Add `is_authenticated` property to User model |
| Image not showing | Use `/media/products/filename.webp` format, no spaces in filename |
| CORS error | Make sure `corsheaders` is first in `MIDDLEWARE` |
| 404 on `/` | Normal — Django only handles `/api/` routes, React handles the rest |

---

##  Author

**Th34n** — Cloth Store Project  
Database & Web Development Course — S2