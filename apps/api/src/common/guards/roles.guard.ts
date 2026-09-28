import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// RBAC per endpoint (PRD 8 Security + matriks hak akses bagian 4.1).
// Aturan: Owner punya akses penuh ke semua modul; endpoint khusus Owner
// (mis. kelola harga & pengaturan) tidak bisa diakses Admin.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Tidak terautentikasi');

    // Owner melewati semua endpoint
    if (user.role === Role.OWNER) return true;

    // Endpoint khusus Owner tidak bisa diakses role lain
    if (requiredRoles.includes(Role.OWNER) && !requiredRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Hanya Owner yang memiliki akses');
    }

    if (requiredRoles.includes(user.role)) return true;

    throw new ForbiddenException('Role tidak memiliki akses');
  }
}
