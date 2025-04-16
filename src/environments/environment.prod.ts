export const environment = {
  name: 'prod',
  production: true,
  stomp_debug: false,
  debugOverrideRoomRole: false,
  graphql: true,
  version: {
    commitHash: '$VERSION_COMMIT_HASH',
    commitDate: '$VERSION_COMMIT_DATE',
  },
  features: ['extension-app-logo'],
};
