# Website kỷ yếu – bản có trình chỉnh sửa riêng

## Cách mở trình chỉnh sửa
1. Mở website đã triển khai trên GitHub Pages.
2. Ở màn hình nhập tên, nhập chính xác: `Khổng Tiến Anh đẹp trai`.
3. Sau khi thiệp mở ra, bảng **Chỉnh sửa thiệp mời** sẽ xuất hiện bên dưới.
4. Sửa lời mời, tiêu đề, lời nhắn, thời gian, địa điểm, chữ trên nút; chọn ảnh thiệp, ảnh nền và kiểu chữ.
5. Bấm **Lưu thay đổi trên máy này** để lưu trong trình duyệt đang dùng.
6. Muốn cập nhật cho tất cả khách xem: bấm **Tải config.js để cập nhật GitHub**, rồi thay file `config.js` cũ trong repository bằng file vừa tải và commit changes.

## Lưu ý quan trọng
- Đây là website tĩnh chạy bằng GitHub Pages. Phần chỉnh sửa được mở bằng một cụm từ bí mật ở phía trình duyệt, không phải hệ thống đăng nhập bảo mật; người biết mã nguồn có thể xem được cụm từ này. Không dùng nó để bảo vệ dữ liệu nhạy cảm.
- Nút lưu trên máy này chỉ lưu trong trình duyệt hiện tại. Muốn mọi người thấy nội dung mới, cần xuất `config.js` và cập nhật file đó lên GitHub.
- Ảnh tải lên được nhúng vào `config.js`; nên chọn ảnh dưới 3 MB.
- Giữ thư mục `assets/` của website gốc khi tải dự án lên GitHub để các ảnh mặc định và hình nền trang đăng nhập hiển thị đúng.

## Triển khai
Giữ nguyên cấu hình GitHub Pages: branch `main`, folder `/ (root)`. Sau khi thay file, chờ GitHub Pages cập nhật rồi tải lại website.


## Bảng quản trị và thư viện ảnh
- Nhập tên `Khổng Tiến Anh đẹp trai` để mở bảng chỉnh sửa.
- Dòng “Kính chào” tự động lấy tên mà khách vừa nhập.
- Có thể thay ảnh bìa, ảnh nền và từng ảnh kỷ yếu 1, 2, 3 trong bảng quản trị.
- Chọn “Lưu thay đổi trên máy này” để lưu trong trình duyệt hiện tại.
- Chọn “Tải config.js để cập nhật GitHub”, sau đó thay file `config.js` trong repository để khách khác thấy thay đổi.
- Giữ nguyên thư mục `assets` đang có trong repository.


## Bản sửa lỗi lưu ảnh
Bản này dùng IndexedDB thay cho localStorage để lưu ảnh và cấu hình, giúp tránh lỗi vượt giới hạn localStorage. Mỗi ảnh tối đa 5 MB. Muốn mọi khách đều thấy thay đổi, vẫn cần xuất config.js và cập nhật lên GitHub.


## Xác nhận tham gia và tối ưu ảnh
- Nút “Chấp nhận lời mời” mở hộp xác nhận. Khi khách đồng ý, website mở email đã soạn sẵn gửi tới `khongtienanhlrtt@gmail.com`; khách cần bấm Gửi. GitHub Pages thuần không có máy chủ để tự gửi email trực tiếp.
- Có hiệu ứng mở trang, hộp xác nhận, nút bấm và tiếng click tạo bằng Web Audio (không tải thêm thư viện).
- Ảnh tải lên tối đa 15 MB mỗi ảnh gốc; website tự thu nhỏ cạnh dài tối đa 1600 px và nén WebP mục tiêu khoảng 450 KB, giới hạn 500 KB mỗi ảnh sau nén.


## Lưu tên đăng nhập và đăng xuất
- Ở màn hình đầu, bật **Nhớ tên trên thiết bị này** để trình duyệt ghi nhớ tên đã nhập bằng IndexedDB. Lần sau mở website trên cùng trình duyệt/thiết bị, tên sẽ được điền sẵn.
- Nút **Đăng xuất** đưa người dùng về màn hình nhập tên; tên đã nhớ vẫn được giữ lại để tiện đăng nhập lần sau. Bỏ chọn ô nhớ tên khi đăng nhập để xóa tên đã lưu.
- Đây là trang tĩnh chỉ đăng nhập bằng tên, không có mật khẩu hay xác thực máy chủ; không dùng cách này để bảo vệ dữ liệu bí mật.

## Nội dung có thể chỉnh sửa
Trong bảng PRIVATE EDITOR có thể chỉnh tiêu đề trang, nội dung màn hình đăng nhập, lời chào, tiêu đề và nội dung thiệp, ngày giờ, địa điểm, chữ nút, email nhận RSVP, lời nhắn cuối trang, chú thích ảnh, font và các ảnh. Sau khi lưu trên máy, bấm **Tải config.js để cập nhật GitHub** rồi thay file config.js trong repository để công khai thay đổi cho tất cả khách.


## Tự động gửi thông báo khi khách xác nhận (EmailJS)
1. Tạo tài khoản tại https://www.emailjs.com/ và kết nối dịch vụ email của bạn.
2. Tạo một Email Template. Đặt người nhận (To Email) cố định là `khongtienanhlrtt@gmail.com` (hoặc email bạn muốn nhận).
3. Trong nội dung mẫu, dùng các biến: `{{guest_name}}`, `{{event_date}}`, `{{event_place}}`, `{{message}}`. Ví dụ tiêu đề: `Xác nhận tham gia kỷ yếu - {{guest_name}}`.
4. Lấy Public Key, Service ID và Template ID trong trang quản lý EmailJS.
5. Điền ba giá trị này vào `config.js` tại các trường `emailjsPublicKey`, `emailjsServiceId`, `emailjsTemplateId`, rồi cập nhật repository GitHub. Có thể điền trong bảng quản trị website rồi xuất `config.js` như các thiết lập khác.
6. Khi khách bấm Đồng ý, website sẽ gửi email thông báo tự động đến địa chỉ người nhận đã cấu hình trong EmailJS template. Khách không cần mở ứng dụng email hoặc tự bấm Gửi.

**Lưu ý:** EmailJS cần được thiết lập và xác minh trước. Không đưa Private Key/secret key vào website; chỉ dùng Public Key ở trình duyệt. Hãy giới hạn domain được phép gửi trong EmailJS và đặt giới hạn gửi để tránh bị lạm dụng.


## Ảnh nền sảnh chính và độ trong suốt
- Đăng nhập bằng tên quản trị `Khổng Tiến Anh đẹp trai` để mở bảng chỉnh sửa.
- Chọn mục **Ảnh nền sảnh chính** để tải ảnh riêng cho khu vực lời mời chính (không thay ảnh nền toàn trang hoặc ảnh bìa).
- Kéo thanh **Độ trong suốt ảnh nền sảnh chính** từ 0% đến 100%; ảnh xem trước và phần trăm thay đổi ngay khi kéo.
- Chọn **Xóa ảnh nền sảnh chính** nếu muốn bỏ ảnh đang dùng.
- Bấm **Lưu thay đổi trên máy này** để lưu trong trình duyệt hiện tại. Để cập nhật cho khách khác, bấm **Tải config.js để cập nhật GitHub** rồi thay file `config.js` trên GitHub như hướng dẫn phía trên.
- Cấu hình mới dùng hai trường `lobbyBackgroundImage` và `lobbyBackgroundOpacity`; các thiết lập ảnh nền toàn trang cũ vẫn được giữ riêng.
