export class ValidationUtils {
  

     static validateBankName(name: string): { valid: boolean, message: string } {
    if (!name) {
      return { valid: false, message: 'Name is required' };
    }
    if (name.length < 3) {
      return { valid: false, message: 'Name must be at least 3 characters' };
    }
    const re = /^[a-z\.\'\- ]+$/i;
    if (!re.test(name)) {
      return { valid: false, message: "Only a-z, ., -, single quote and spaces allowed" };
    }
    return { valid: true, message: '' };
  }


  static validateForName(desc: string): { valid: boolean, message: string } {
    // if (!desc) {
    //   return { valid: false, message: ' is required' };
    // }

    // same regex as your JS version
    const re = /^[a-z0-9\.,;:=$\-_\+\'\"/\\!@`#%&\*()#\?\n\r ]+$/i;
    if (!re.test(desc)) {
      return {
        valid: false,
        message: "Only a-z, 0-9, . , ; : = $ - _ + ' \" / \\ ! @ ` # % & * ( ) ? and line breaks are allowed"
      };
    }

    return { valid: true, message: '' };
  }

}