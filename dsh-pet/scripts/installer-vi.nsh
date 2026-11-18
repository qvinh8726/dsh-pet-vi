; Bản dịch các thông báo riêng của electron-builder; giao diện NSIS dùng Vietnamese.
!macro customHeader
  !pragma warning push
  !pragma warning disable 6030
  LangString win7Required 1066 "Ứng dụng cần Windows 10 trở lên."
  LangString x64WinRequired 1066 "Ứng dụng cần Windows 64 bit."
  LangString appRunning 1066 "${PRODUCT_NAME} đang chạy.$\r$\nNhấn Đồng ý để đóng ứng dụng trước khi cài đặt.$\r$\nNếu chưa đóng được, hãy thoát ứng dụng từ khay hệ thống."
  LangString appCannotBeClosed 1066 "Chưa đóng được ${PRODUCT_NAME}.$\r$\nHãy thoát ứng dụng từ khay hệ thống rồi nhấn Thử lại."
  LangString installing 1066 "Đang cài đặt, vui lòng chờ..."
  LangString areYouSureToUninstall 1066 "Bạn có muốn gỡ ${PRODUCT_NAME} không?"
  LangString decompressionFailed 1066 "Không giải nén được bộ cài. Hãy tải lại và chạy bộ cài một lần nữa."
  LangString uninstallFailed 1066 "Không gỡ được phiên bản cũ. Hãy đóng ứng dụng rồi chạy lại bộ cài."
  LangString appClosing 1066 "Đang đóng ${PRODUCT_NAME}..."
  !pragma warning pop
!macroend
