import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { DeviceService } from '../services/DeviceService';
import { ok } from '../types/api';
import type { RegisterDeviceInput } from '../validators/device.schemas';

export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw unauthorized();
    }
    const device = await this.deviceService.register(req.user, req.body as RegisterDeviceInput);
    res.status(201).json(ok({ device }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw unauthorized();
    }
    const deviceId = String(req.params.id);
    const device = await this.deviceService.getById(req.user, deviceId);
    res.status(200).json(ok({ device }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw unauthorized();
    }
    const branchId =
      typeof req.query.branchId === 'string' ? req.query.branchId : undefined;
    const devices = await this.deviceService.list(req.user, branchId);
    res.status(200).json(ok({ devices }));
  };
}
