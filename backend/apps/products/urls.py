from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    ProductListView,
    ProductDetailView,
    VariantCreateView,
    VariantDetailView,
    ImageUploadView,
)

urlpatterns = [
    # Categories
    path('categories/',                     CategoryListView.as_view(),   name='category-list'),
    path('categories/<int:pk>/',            CategoryDetailView.as_view(), name='category-detail'),

    # Products
    path('products/',                       ProductListView.as_view(),    name='product-list'),
    path('products/<int:pk>/',              ProductDetailView.as_view(),  name='product-detail'),

    # Image upload
    path('products/upload-image/',          ImageUploadView.as_view(),    name='image-upload'),

    # Variants
    path('products/<int:pk>/variants/',     VariantCreateView.as_view(),  name='variant-create'),
    path('variants/<int:pk>/',              VariantDetailView.as_view(),  name='variant-detail'),
]