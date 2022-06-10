import { Injectable } from '@angular/core';
interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}
  isModalVisible(id: string): boolean {
    // Boolean(this.modals.find((modal) => modal.id === id)?.visible);
    return !!this.modals.find((modal) => modal.id === id)?.visible;
  }
  toggleModal(id: string) {
    const modal = this.modals.find((modal) => modal.id === id);
    if (modal) {
      modal.visible = !modal.visible;
    }
  }

  registerModal(id: string) {
    this.modals.push({
      id,
      visible: false,
    });
  }
  unregisterModal(id: string) {
    this.modals = this.modals.filter((modal) => modal.id !== id);
  }
}
