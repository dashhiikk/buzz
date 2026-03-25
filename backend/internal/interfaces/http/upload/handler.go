package upload

import (
	"Buzz/internal/infra/upload"
	"Buzz/internal/middleware"
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	fileUploader *upload.FileUploader
}

func NewHandler(fileUploader *upload.FileUploader) *Handler {
	return &Handler{fileUploader: fileUploader}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// UploadFile godoc
// @Summary      Загрузить файл на сервер
// @Description  Принимает multipart/form-data с полем "file" и сохраняет файл на сервере. Возвращает URL, по которому файл будет доступен. Файлы сохраняются с уникальным именем, исходное имя не используется.
// @Tags         upload
// @Security     BearerAuth
// @Accept       mpfd
// @Produce      json
// @Param        file formData file true "Файл для загрузки"
// @Success      200 {object} UploadFileResponse "Успешная загрузка, возвращён URL"
// @Failure      400 {object} ErrorResponse "Файл слишком большой, неверный тип или отсутствует файл"
// @Failure      401 {object} ErrorResponse "Неавторизован"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера (например, не удалось сохранить файл)"
// @Router       /upload [post]
func (h *Handler) UploadFile(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10<<20+1024)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("file too large"))
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("missing file"))
		return
	}
	defer file.Close()

	url, err := h.fileUploader.Upload(file, header)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{"url": url})
}
