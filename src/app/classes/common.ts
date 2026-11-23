export class Common {
  
getStatusLabel(status: number | string): string {
  switch (+status) {
    case 1:
      return 'Active';
    case 2:
      return 'Inactive';
    case 3:
      return 'Deleted';
    default:
      return 'Unknown';
  }
}

getStatusClass(status: number | string): string {
  switch (+status) {
    case 1:
      return 'status-badge active';
    case 2:
      return 'status-badge inactive';
    case 3:
      return 'status-badge deleted';
    default:
      return 'status-badge';
  }
}


  parseEntryDate(dateStr: string): Date {
    const [datePart, timePart, ampm] = dateStr.split(/[\s:]+/); // e.g., ["08-08-2025", "05", "53", "PM"]
    const [day, month, year] = datePart.split('-').map(Number);
    let hour = Number(timePart);
    const minute = Number(dateStr.split(/[\s:]+/)[2]);

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  }



}
