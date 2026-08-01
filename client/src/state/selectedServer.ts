export let selectedServerId = 'server-001';

export function setSelectedServerId(id: string) {
  selectedServerId = id;
}

export function getSelectedServerId() {
  return selectedServerId;
}
