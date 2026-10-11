function utcMillis(value) {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

// A historical receipt is checked against its accepted_at, never today's clock.
export function validAppointmentReceipts(data, { allow = true } = {}) {
  const receipts = data?.result ? [data]
    : data?.receipt ? [data.receipt] : data?.turn_statuses ?? [];
  return receipts.every(receipt => {
    const appointment = receipt.result?.appointment_receipt;
    if (appointment === undefined) return true;
    if (!allow || !appointment || receipt.operation !== 'turn' ||
      receipt.status !== 'completed' || receipt.error !== null ||
      !utcMillis(receipt.accepted_at) ||
      !['requested_start', 'zoho_start', 'verified_at'].every(key => utcMillis(appointment[key])) ||
      appointment.requested_start !== appointment.zoho_start ||
      appointment.verified_at < receipt.accepted_at) return false;
    try {
      new Intl.DateTimeFormat('en', { timeZone: appointment.client_time_zone }).format();
      return true;
    } catch { return false; }
  });
}
