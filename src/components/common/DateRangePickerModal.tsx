import React, { useState, useEffect } from 'react';
import styles from './DateRangePickerModal.module.scss';

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialStartDate,
  initialEndDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null); // For hover/selection preview

  // Parse date string (YYYY.MM.DD format)
  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  };

  // Initialize dates from props
  useEffect(() => {
    if (isOpen) {
      const parsedStart = parseDateString(initialStartDate || '');
      const parsedEnd = parseDateString(initialEndDate || '');
      
      setStartDate(parsedStart);
      setEndDate(parsedEnd);
      setTempEndDate(null);
      
      // Set current month to start date if available, otherwise end date, otherwise current month
      if (parsedStart) {
        setCurrentMonth(new Date(parsedStart.getFullYear(), parsedStart.getMonth(), 1));
      } else if (parsedEnd) {
        setCurrentMonth(new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), 1));
      } else {
        setCurrentMonth(new Date());
      }
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // Handle click outside to close (without overlay)
  // Must be before early return to follow Rules of Hooks
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const pickerElement = document.querySelector(`.${styles.dropdown}`);
      
      if (pickerElement && !pickerElement.contains(target)) {
        // Check if click is not on the date input fields (desktop or mobile)
        const dateInputs = document.querySelectorAll(`.${styles.dateInput}`);
        const mobileDateInputWrappers = document.querySelectorAll('[class*="mobileDateInputWrapper"]');
        let clickedOnInput = false;
        
        dateInputs.forEach((input) => {
          if (input.contains(target)) {
            clickedOnInput = true;
          }
        });
        
        mobileDateInputWrappers.forEach((wrapper) => {
          if (wrapper.contains(target)) {
            clickedOnInput = true;
          }
        });
        
        if (!clickedOnInput) {
          onClose();
        }
      }
    };

    // Small delay to avoid immediate close when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 현재 월의 첫 날과 마지막 날
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 이전/다음 월 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  // 날짜 비교 (날짜만, 시간 제외)
  const compareDates = (date1: Date, date2: Date): number => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() - d2.getTime();
  };

  // 날짜 선택 (Range selection logic)
  const selectDate = (date: Date) => {
    if (!startDate) {
      // First click: set start date
      setStartDate(date);
      setEndDate(null);
      setTempEndDate(null);
    } else if (!endDate) {
      // Second click: set end date
      if (compareDates(date, startDate) < 0) {
        // If selected date is before start date, swap them
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setTempEndDate(null);
      
      // Auto-close and confirm when both dates are selected
      const finalStart = compareDates(date, startDate) < 0 ? date : startDate;
      const finalEnd = compareDates(date, startDate) < 0 ? startDate : date;
      onConfirm(formatDate(finalStart), formatDate(finalEnd));
      onClose();
    } else {
      // Both dates selected: reset and start new selection
      setStartDate(date);
      setEndDate(null);
      setTempEndDate(null);
    }
  };

  // Check if date is in selected range
  const isInRange = (date: Date): boolean => {
    if (!startDate) return false;
    const effectiveEnd = endDate || tempEndDate;
    if (!effectiveEnd) return false;
    
    // Compare dates (date only, ignore time)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endOnly = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate());
    
    const dateTime = dateOnly.getTime();
    const startTime = startOnly.getTime();
    const endTime = endOnly.getTime();
    
    // Check if date is between start and end (inclusive)
    return dateTime >= Math.min(startTime, endTime) && dateTime <= Math.max(startTime, endTime);
  };

  // Check if date is start date
  const isStartDate = (date: Date): boolean => {
    if (!startDate) return false;
    return formatDate(date) === formatDate(startDate);
  };

  // Check if date is end date
  const isEndDate = (date: Date): boolean => {
    if (!endDate) return false;
    return formatDate(date) === formatDate(endDate);
  };

  // Handle mouse enter for range preview
  const handleDateHover = (date: Date) => {
    if (startDate && !endDate) {
      setTempEndDate(date);
    }
  };

  // Handle mouse leave to clear preview
  const handleDateLeave = () => {
    if (startDate && !endDate) {
      setTempEndDate(null);
    }
  };

  // 확인 버튼 클릭 (더 이상 사용하지 않음, handleDateRangeConfirm 사용)

  // 달력 그리드 생성
  const calendarDays: (Date | null)[] = [];
  
  // 이전 달의 마지막 날들 (빈 칸)
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 현재 달의 날들
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthYear = `${monthNames[month]} ${year}`;

  // Floating panel positioning - appears below the input field using absolute positioning
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '0',
    transform: 'none',
  };

  if (!isOpen) return null;

  return (
    <div className={styles.dropdown} style={panelStyle}>
        <div className={styles.content}>
          <div className={styles.calendar}>
            <div className={styles.monthHeader}>
              <button className={styles.monthNav} onClick={goToPreviousMonth}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#E4E4E4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h3 className={styles.monthYear}>{monthYear}</h3>
              <button className={styles.monthNav} onClick={goToNextMonth}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#E4E4E4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className={styles.weekDays}>
              {weekDays.map((day) => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.calendarGrid}>
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, rowIndex) => {
                const rowDays = calendarDays.slice(rowIndex * 7, (rowIndex + 1) * 7);
                const paddedRowDays = [...rowDays];
                while (paddedRowDays.length < 7) {
                  paddedRowDays.push(null);
                }
                
                return (
                  <div key={rowIndex} className={styles.calendarRow}>
                    {paddedRowDays.map((date, cellIndex) => {
                      const index = rowIndex * 7 + cellIndex;
                      if (!date) {
                        return <div key={`empty-${index}`} className={styles.calendarCellEmpty} />;
                      }

                      const isStart = isStartDate(date);
                      const isEnd = isEndDate(date);
                      const inRange = isInRange(date);
                      const isRangeStart = inRange && isStart;
                      const isRangeEnd = inRange && isEnd;
                      const isInMiddle = inRange && !isStart && !isEnd;

                      return (
                        <button
                          key={formatDate(date)}
                          className={`${styles.calendarCell} ${
                            isStart ? styles.startDate : ''
                          } ${
                            isEnd ? styles.endDate : ''
                          } ${
                            isInMiddle ? styles.inRange : ''
                          } ${
                            (isStart || isEnd) ? styles.selected : ''
                          }`}
                          onClick={() => selectDate(date)}
                          onMouseEnter={() => handleDateHover(date)}
                          onMouseLeave={handleDateLeave}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
};

export default DateRangePickerModal;

