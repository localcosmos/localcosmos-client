import type { TaxonType } from "../features/BackboneTaxonomy";
import { GenericFormField } from "../features/GenericForm";
import { TemporalJson } from "../types/DateTime";
import { dateTimeToTemporalJson } from "./Dataset";

const NoConverter = {
  compress(genericField: GenericFormField, value: number | string): number | string {
    return value;
  },
  decompress(genericField: GenericFormField, value: number | string): number | string {
    return value;
  },
  compressedInitial (genericField: GenericFormField): number | string | null {
    let initial = null;
    if (genericField.definition.initial || genericField.definition.initial === 0) {
      initial = genericField.definition.initial;
    }
    return initial;
  }
};

const FloatConverter = {
  compress(genericField: GenericFormField, value: number | string): number {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }
    return value;
  },
  decompress(genericField: GenericFormField, value: number | string): number {
    return FloatConverter.compress(genericField, value);
  },
  compressedInitial (genericField: GenericFormField): number | string | null {
    return NoConverter.compressedInitial(genericField);
  }
};

const B64Converter = {
  compress(genericField: GenericFormField, value: Record<string, any>): string {
    return btoa(JSON.stringify(value));
  },
  decompress(genericField: GenericFormField, value: string): Record<string, any> {
    return JSON.parse(atob(value));
  },
  compressedInitial (genericField: GenericFormField): string | null {
    return null;
  }
};

export const GenericValueManager = {

  TaxonField: {
    compress(genericField: GenericFormField, value: TaxonType): string {
      return B64Converter.compress(genericField, value);
    },

    decompress(genericField: GenericFormField, value: string): TaxonType | null {
      return B64Converter.decompress(genericField, value) as TaxonType;
    },

    compressedInitial (genericField: GenericFormField): string | null {
      return null;
    }
  },

  SelectTaxonField: {
    compress(genericField: GenericFormField, value: TaxonType): string {
      return value.nameUuid;
    },

    decompress(genericField: GenericFormField, value: string): TaxonType | null {
      let selectedTaxon: TaxonType | null = null;
      genericField.taxonomicRestrictions.every((taxonForRestriction) => {
        if (taxonForRestriction.nameUuid === value) {
          selectedTaxon = {
            taxonSource: taxonForRestriction.taxonSource,
            taxonLatname: taxonForRestriction.taxonLatname,
            taxonAuthor: taxonForRestriction.taxonAuthor,
            nameUuid: taxonForRestriction.nameUuid,
            taxonNuid: taxonForRestriction.taxonNuid,
          };
          return false;
        }
        return true;
      });

      return selectedTaxon;
    },
    compressedInitial (genericField: GenericFormField): string | null {
      return null;
    }
  },

  PointJSONField: B64Converter,

  DateTimeJSONField: {

    dateToFieldValue(genericField: GenericFormField, date: Date, offset: number): string {
      date.setMinutes(date.getMinutes() - offset);
      let valueForField
      if (genericField.definition.mode === 'date') {
        valueForField = date.toISOString().slice(0, 10);
      } else {
        valueForField = date.toISOString().slice(0, 16);
      }
      return valueForField;
    },

    compress(genericField: GenericFormField, value: Date | TemporalJson): string {
      if (value instanceof Date) {
        const outputDate = new Date(value);
        const offset = outputDate.getTimezoneOffset()
        return this.dateToFieldValue(genericField, outputDate, offset);

      } else if ('cron' in value) {
        const outputDate = new Date(value.cron.timestamp);
        return this.dateToFieldValue(genericField, outputDate, value.cron.timezoneOffset);
      }

      return '';
    },

    decompress(genericField: GenericFormField, value: string): TemporalJson {
      const date = new Date(value);
      const cron = dateTimeToTemporalJson(date);
      return cron;
    },

    compressedInitial(genericField: GenericFormField): string {
      const outputDate = new Date();
      const offset = outputDate.getTimezoneOffset();
      return this.dateToFieldValue(genericField, outputDate, offset);
    },
  },

  IntegerField: {
    compress(genericField: GenericFormField, value: string | number): number {
      if (typeof value === 'string') {
        value = parseInt(value);
      }
      return value;
    },

    decompress(genericField: GenericFormField, value: string | number): number {
      return GenericValueManager.IntegerField.compress(genericField, value);
    },

    compressedInitial (genericField: GenericFormField): string | number | null {
      return NoConverter.compressedInitial(genericField);
    }
  },

  DecimalField: FloatConverter,
  FloatField: FloatConverter,

  CharField: NoConverter,
  ChoiceField: NoConverter,

  PictureField: NoConverter,

};