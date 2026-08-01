export let selectedGachaId = 'basic';

export function setSelectedGacha(id: string) {
  selectedGachaId = id;
}

export function getSelectedGachaId() {
  return selectedGachaId;
}
