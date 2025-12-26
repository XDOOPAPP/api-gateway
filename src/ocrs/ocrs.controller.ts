import { Controller } from '@nestjs/common';
import { OcrsService } from './ocrs.service';

@Controller()
export class OcrsController {
  constructor(private readonly ocrsService: OcrsService) {}
}
