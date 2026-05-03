import { Platform } from "react-native";
import {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  clampDate,
  dateToYYYYMMDD,
  parseDateOnly,
} from "@/lib/dateOnly";

export type AndroidDatePickOptions = {
  value: string | undefined;
  minimumDate?: string;
  maximumDate?: string;
  onPick: (dateYYYYMMDD: string) => void;
};

export function openAndroidDatePicker({
  value,
  minimumDate,
  maximumDate,
  onPick,
}: AndroidDatePickOptions): void {
  if (Platform.OS !== "android") return;

  const min = minimumDate ? parseDateOnly(minimumDate) : undefined;
  const max = maximumDate ? parseDateOnly(maximumDate) : undefined;
  const base = clampDate(parseDateOnly(value ?? dateToYYYYMMDD(new Date())), min, max);

  DateTimePickerAndroid.open({
    value: base,
    mode: "date",
    minimumDate: min,
    maximumDate: max,
    onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (event.type === "set" && selectedDate) {
        const next = clampDate(selectedDate, min, max);
        onPick(dateToYYYYMMDD(next));
      }
    },
  });
}
