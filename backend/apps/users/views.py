from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer, MediCoreTokenSerializer
from .permissions import IsAdminUser

class MediCoreLoginView(TokenObtainPairView):
    serializer_class = MediCoreTokenSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset           = User.objects.filter(status='active').order_by('-date_joined')
    serializer_class   = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['first_name','last_name','email','employee_id']
    ordering_fields    = ['date_joined','last_name','role']

    def get_serializer_class(self):
        if self.action in ('update','partial_update'):
            return UserUpdateSerializer
        return UserSerializer

    def perform_destroy(self, instance):
        instance.status = 'inactive'
        instance.save()

    @action(detail=False, methods=['get','patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

class RegisterView(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class   = RegisterSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'message': 'Account created.', 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)