  /**
   * Returns the server host address stored in the front/.env file, with an
   * optional port.
   *
   * @param port - Optional port to add to the server host address.
   * @returns The server host address, including port if specified.
   */
export function getServerIP(port?: number) : string
{
    let ipaddr = `http://${process.env.REACT_APP_SERVER_ADDRESS}`;
    if (port === undefined)
        ipaddr += '/'
    else
        ipaddr += `:${port.toString()}/`;
    return ipaddr;
}