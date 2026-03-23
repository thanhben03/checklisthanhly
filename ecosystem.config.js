module.exports = {
  apps: [
    {
      name: "checklist-hanh-ly",
      script: "node_modules/.bin/next",
      args: "start -p 9999",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 9999,
      },
    },
  ],
};
