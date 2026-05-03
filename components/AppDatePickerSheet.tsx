import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  clampDateString,
  dateToYYYYMMDD,
  parseDateOnly,
} from "@/lib/dateOnly";

export type AppDatePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  value: string;
  minimumDate?: string;
  maximumDate?: string;
  /** Shown above the picker on web / modal header on iOS */
  title?: string;
  onConfirm: (dateYYYYMMDD: string) => void;
};

export function AppDatePickerSheet({
  visible,
  onClose,
  value,
  minimumDate,
  maximumDate,
  title = "Choose date",
  onConfirm,
}: AppDatePickerSheetProps) {
  const [iosDraft, setIosDraft] = useState<Date>(() =>
    parseDateOnly(value || dateToYYYYMMDD(new Date())),
  );
  const [webDraft, setWebDraft] = useState(
    value || dateToYYYYMMDD(new Date()),
  );

  useEffect(() => {
    if (!visible) return;
    const v = value || dateToYYYYMMDD(new Date());
    setIosDraft(parseDateOnly(v));
    setWebDraft(v);
  }, [visible, value]);

  const commitIOS = () => {
    onConfirm(
      clampDateString(dateToYYYYMMDD(iosDraft), minimumDate, maximumDate),
    );
    onClose();
  };

  const commitWeb = () => {
    onConfirm(clampDateString(webDraft, minimumDate, maximumDate));
    onClose();
  };

  if (Platform.OS === "android") {
    return null;
  }

  return (
    <>
      {Platform.OS === "ios" && (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onClose}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={onClose}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.sheet}
            >
              <Text style={styles.sheetTitle}>{title}</Text>
              <DateTimePicker
                value={iosDraft}
                mode="date"
                display="spinner"
                onChange={(_, d) => d && setIosDraft(d)}
                minimumDate={minimumDate ? parseDateOnly(minimumDate) : undefined}
                maximumDate={maximumDate ? parseDateOnly(maximumDate) : undefined}
              />
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.sheetBtn, styles.cancelBtn]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sheetBtn, styles.doneBtn]}
                  onPress={commitIOS}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {Platform.OS === "web" && (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onClose}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={onClose}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.sheet}
            >
              <Text style={styles.sheetTitle}>{title}</Text>
              <View pointerEvents="box-none">
                {React.createElement("input", {
                  type: "date",
                  value: webDraft,
                  min: minimumDate,
                  max: maximumDate,
                  style: {
                    width: "100%",
                    fontSize: 18,
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#e5e7eb",
                    borderRadius: 10,
                    color: "#1f2937",
                    outlineWidth: 0,
                  },
                  onChange: (e: { target: { value: string } }) =>
                    setWebDraft(e.target.value),
                })}
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.sheetBtn, styles.cancelBtn]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sheetBtn, styles.doneBtn]}
                  onPress={commitWeb}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    justifyContent: "space-between",
  },
  sheetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
  },
  cancelBtnText: {
    fontWeight: "600",
    color: "#4b5563",
  },
  doneBtn: {
    backgroundColor: "#6366f1",
  },
  doneBtnText: {
    fontWeight: "600",
    color: "#fff",
  },
});
