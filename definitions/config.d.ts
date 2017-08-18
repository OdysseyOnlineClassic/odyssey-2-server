declare namespace Server {
  export interface Config {
    server: {
      port: number,
      adminPort: number,
      log: {
        level: string,
        file: string
      },
      interval: number
    },
    scripts: {
      directory: string
    }
  }
}
