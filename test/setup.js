import { vi } from 'vitest';

// Mock browser storage
const mockStorage = {
  sync: {
    data: {},
    get: vi.fn(async key => {
      if (typeof key === 'string') {
        return { [key]: mockStorage.sync.data[key] };
      }
      return mockStorage.sync.data;
    }),
    set: vi.fn(async items => {
      Object.assign(mockStorage.sync.data, items);
    }),
    clear: vi.fn(async () => {
      mockStorage.sync.data = {};
    })
  },
  local: {
    data: {},
    get: vi.fn(async key => {
      if (typeof key === 'string') {
        return { [key]: mockStorage.local.data[key] };
      }
      return mockStorage.local.data;
    }),
    set: vi.fn(async items => {
      Object.assign(mockStorage.local.data, items);
    }),
    clear: vi.fn(async () => {
      mockStorage.local.data = {};
    })
  }
};

// Mock browser runtime
const mockRuntime = {
  sendMessage: vi.fn(),
  openOptionsPage: vi.fn()
};

// Create browser mock
global.browser = {
  storage: mockStorage,
  runtime: mockRuntime
};

// Helper to reset mocks between tests
export function resetBrowserMocks() {
  mockStorage.sync.data = {};
  mockStorage.local.data = {};
  mockStorage.sync.get.mockClear();
  mockStorage.sync.set.mockClear();
  mockStorage.local.get.mockClear();
  mockStorage.local.set.mockClear();
  mockRuntime.sendMessage.mockClear();
  mockRuntime.openOptionsPage.mockClear();
}

// Helper to set cached data
export function setCachedData(data) {
  mockStorage.local.data = data;
}

// Helper to get cached data
export function getCachedData() {
  return mockStorage.local.data;
}

// Helper to set username
export function setUsername(username) {
  mockStorage.sync.data.githubUsername = username;
}

// Helper to mock contribution response
export function mockContributionResponse(html) {
  mockRuntime.sendMessage.mockResolvedValue({ html });
}

// Helper to mock contribution error
export function mockContributionError(error) {
  mockRuntime.sendMessage.mockResolvedValue({ error });
}
