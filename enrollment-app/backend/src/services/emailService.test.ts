import { emailService } from './emailService';

describe('emailService.computePricing', () => {
  it('uses a flat rate per course/session instead of multiplying by duration', () => {
    const result = emailService.computePricing(
      [
        { firstName: 'Ana', lastName: 'Test', age: 30 },
        { firstName: 'Leo', lastName: 'Test', age: 12 },
      ],
      2,
      {
        adult: 12,
        child: 8,
        childAgeLimit: 14,
      }
    );

    expect(result.total).toBe('20.00');
    expect(result.lines).toEqual([
      { label: 'Ana Test (30 yo, adult rate)', price: '12.00' },
      { label: 'Leo Test (12 yo, child rate)', price: '8.00' },
    ]);
  });
});
