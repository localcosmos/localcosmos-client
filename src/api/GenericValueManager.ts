import type { TaxonType } from "../features/BackboneTaxonomy";
import { GenericFormField } from "../features/GenericForm";
import { TemporalJson } from "../types/DateTime";
import { dateTimeToTemporalJson } from "./Dataset";

export interface GenericFieldConverter<TInput = any, TCompressed = any, TInitial = any> {
  compress: (genericField: GenericFormField, value: TInput) => TCompressed;
  decompress: (genericField: GenericFormField, value: TCompressed) => TInput | null;
  compressedInitial: (genericField: GenericFormField) => TInitial;
}

const NoConverter: GenericFieldConverter<number | string, number | string, number | string | null> = {
  compress(genericField, value) {
    return value;
  },
  decompress(genericField, value) {
    return value;
  },
  compressedInitial(genericField) {
    let initial = null;
    if (genericField.definition.initial || genericField.definition.initial === 0) {
      initial = genericField.definition.initial;
    }
    return initial;
  }
};

const FloatConverter: GenericFieldConverter<number | string, number, number | string | null> = {
  compress(genericField, value) {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }
    return value;
  },
  decompress(genericField, value) {
    return FloatConverter.compress(genericField, value);
  },
  compressedInitial(genericField) {
    return NoConverter.compressedInitial(genericField);
  }
};

const B64Converter: GenericFieldConverter<Record<string, any>, string, string | null> = {
  compress(genericField, value) {
    return btoa(JSON.stringify(value));
  },
  decompress(genericField, value) {
    return JSON.parse(atob(value));
  },
  compressedInitial(genericField) {
    return null;
  }
};

export const GenericValueManager: Record<string, GenericFieldConverter<any, any, any>> = {

  TaxonField: {
    compress(genericField, value) {
      return B64Converter.compress(genericField, value);
    },

    decompress(genericField, value) {
      return B64Converter.decompress(genericField, value) as TaxonType;
    },

    compressedInitial(genericField) {
      return null;
    }
  },

  SelectTaxonField: {
    compress(genericField, value) {
      return value.nameUuid;
    },

    decompress(genericField, value) {
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
    compressedInitial(genericField) {
      return null;
    }
  },

  PointJSONField: B64Converter,

  DateTimeJSONField: {
    dateToFieldValue(
      genericField: GenericFormField,
      date: Date,
      offset: number
    ): string {
      date.setMinutes(date.getMinutes() - offset);
      let valueForField;
      if (genericField.definition.mode === 'date') {
        valueForField = date.toISOString().slice(0, 10);
      } else {
        valueForField = date.toISOString().slice(0, 16);
      }
      return valueForField;
    },

    compress(genericField, value) {
      if (value instanceof Date) {
        const outputDate = new Date(value);
        const offset = outputDate.getTimezoneOffset();
        // Use 'this' with explicit type assertion
        return (this as any).dateToFieldValue(genericField, outputDate, offset);
      } else if ('cron' in value) {
        const outputDate = new Date(value.cron.timestamp);
        return (this as any).dateToFieldValue(genericField, outputDate, value.cron.timezoneOffset);
      }
      return '';
    },

    decompress(genericField, value) {
      const date = new Date(value);
      const cron = dateTimeToTemporalJson(date);
      return cron;
    },

    compressedInitial(genericField) {
      const outputDate = new Date();
      const offset = outputDate.getTimezoneOffset();
      return (this as any).dateToFieldValue(genericField, outputDate, offset);
    },
  } as GenericFieldConverter<any, any, any> & {
    dateToFieldValue: (genericField: GenericFormField, date: Date, offset: number) => string;
  },

  IntegerField: {
    compress(genericField, value) {
      if (typeof value === 'string') {
        value = parseInt(value);
      }
      return value;
    },

    decompress(genericField, value) {
      return GenericValueManager.IntegerField.compress(genericField, value);
    },

    compressedInitial(genericField) {
      return NoConverter.compressedInitial(genericField);
    }
  },

  DecimalField: FloatConverter,
  FloatField: FloatConverter,

  CharField: NoConverter,
  ChoiceField: NoConverter,

  PictureField: NoConverter,

  BooleanField: NoConverter,

  MultipleChoiceField: NoConverter,

};