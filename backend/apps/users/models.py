from django.db import models


class User(models.Model):
    ROLE_CHOICES   = [('Admin', 'Admin'), ('Sale', 'Sale'), ('Customer', 'Customer')]
    STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]

    user_id    = models.AutoField(primary_key=True)
    name       = models.CharField(max_length=50)
    email      = models.CharField(max_length=100, unique=True)
    password   = models.CharField(max_length=255)       # bcrypt hash
    phone      = models.CharField(max_length=20, blank=True, null=True)
    address    = models.TextField(blank=True, null=True)
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Customer')
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Users'
        managed  = False

    def __str__(self):
        return f"{self.name} ({self.email})"

    # Required by Django REST Framework's IsAuthenticated permission
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False