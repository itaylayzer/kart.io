function ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => {
      return (acc << 8) | parseInt(octet, 10);
    }, 0);
  }
  
  // Example usage:
  const ipNumber = ipToNumber("192.168.0.1");
  console.log(ipNumber); // Output: 3232235521
  