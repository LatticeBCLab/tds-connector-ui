import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateContractAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return address;
}

/**
 * 格式化日期时间为人类易读的格式
 * @param dateString - ISO 日期时间字符串
 * @param options - 格式化选项
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  dateString: string | null | undefined,
  options: {
    includeTime?: boolean;
    locale?: string;
    fallback?: string;
  } = {}
): string {
  const { includeTime = true, locale = 'zh-CN', fallback = '无时间信息' } = options;
  
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.second = '2-digit';
      formatOptions.hour12 = false;
    }
    
    return date.toLocaleString(locale, formatOptions);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * 格式化日期为人类易读的格式（不包含时间）
 * @param dateString - ISO 日期时间字符串
 * @param locale - 语言环境
 * @param fallback - 默认值
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  dateString: string | null | undefined,
  locale: string = 'zh-CN',
  fallback: string = '无日期信息'
): string {
  return formatDateTime(dateString, { includeTime: false, locale, fallback });
}