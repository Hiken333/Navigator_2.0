interface Class {
  id: string;
  /** Полное имя. */
  name: string;
  /** Базовый ТБП. */
  baseClassId: BaseClassID;
  /** Идентификатор сущности. */
  entityId: string;
  /** Является типом ядра. */
  isKernelType: boolean;
  /** Интерфейс класса. */
  classInterface: string;
  /** Флаги (строка из 25 символов). */
  flags: string;
  /** Заголовок в меню (опционально). */
  menuCaption?: string;
  /** Доступность (опционально). */
  isAccessible?: boolean;
  /** Длина отступа (опционально). */
  padLength?: string;
  /** Размер данных (опционально). */
  dataSize?: string;
  /** Точность данных (опционально). */
  dataPrecision?: string;
  /** Свойства (опционально). */
  properties?: string;
  /** Идентификатор группы (опционально). */
  groupId?: string;
}
export type ClassType = Class;
type BaseClassID = "STRUCTURE";
