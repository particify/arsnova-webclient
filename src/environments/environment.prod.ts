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
  features: ['CONTENT_GROUP_TEMPLATES', 'FOCUS_MODE', 'extension-app-logo'],
};
