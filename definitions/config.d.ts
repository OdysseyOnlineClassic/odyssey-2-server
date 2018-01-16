declare namespace Server {
  export interface Config {
    game: {
      accounts: {
        file: string,
      }
    },
    server: {
      adminPort: number,
      dataFolder: string,
      interval: number,
      log: {
        level: string,
        file: string
      },
      port: number
    },
    scripts: {
      directory: string
    }
  }
}
