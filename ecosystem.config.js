module.exports = {
  apps: [
    {
      name: 'aggregated-public-information',
      cwd: '/home/deploy/aggregated-public-information',
      script: 'yarn',
      args: 'start',
      interpreter: 'none',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048',
        NODE_TLS_REJECT_UNAUTHORIZED:0
      }
    }
  ]
};