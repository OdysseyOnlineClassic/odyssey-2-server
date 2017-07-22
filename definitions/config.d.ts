declare namespace Odyssey {
  export interface Config {
    server: {
      port: number,
      adminPort: number,
      log: {
        level: string,
        file: string
      },
      interval: number
    }
  }
}
