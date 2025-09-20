/**
 * The proper way to pass a ProcessHandle from parent handle to subprocess/child handle is to create a new closer:
 * `{close: () => { 
 *      //clean parent event loop
 *      handle.close() 
 *      }
 * }`
 * @returns void
 */
export interface ProcessHandle {
    close: () => void
}