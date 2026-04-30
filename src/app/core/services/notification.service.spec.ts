import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let matSnackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        {
          provide: MatSnackBar,
          useValue: {
            open: jasmine.createSpy('open'),
            dismiss: jasmine.createSpy('dismiss'),
          },
        },
      ],
    });
    service = TestBed.inject(NotificationService);
    matSnackBar = TestBed.inject(MatSnackBar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should show success notification', () => {
      service.success('Success message');

      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Success message',
        'Close',
        jasmine.objectContaining({
          panelClass: ['notification-success'],
        })
      );
    });
  });

  describe('error', () => {
    it('should show error notification', () => {
      service.error('Error message');

      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Error message',
        'Close',
        jasmine.objectContaining({
          panelClass: ['notification-error'],
        })
      );
    });
  });

  describe('warning', () => {
    it('should show warning notification', () => {
      service.warning('Warning message');

      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Warning message',
        'Close',
        jasmine.objectContaining({
          panelClass: ['notification-warning'],
        })
      );
    });
  });

  describe('info', () => {
    it('should show info notification', () => {
      service.info('Info message');

      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Info message',
        'Close',
        jasmine.objectContaining({
          panelClass: ['notification-info'],
        })
      );
    });
  });

  describe('dismissAll', () => {
    it('should dismiss all notifications', () => {
      service.dismissAll();

      expect(matSnackBar.dismiss).toHaveBeenCalled();
    });
  });
});
