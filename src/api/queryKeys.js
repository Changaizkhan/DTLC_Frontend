export const queryKeys = {
  auth: {
    session: ['auth', 'session'],
  },
  shipments: {
    all: ['shipments'],
    list: (params) => ['shipments', 'list', params],
    detail: (id) => ['shipments', 'detail', id],
  },
};
