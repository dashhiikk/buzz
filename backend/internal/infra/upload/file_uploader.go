package upload

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

type FileUploader struct {
	uploadPath  string
	maxSize     int64
	allowedExts map[string]bool
}

func NewFileUploader(uploadPath string, maxSize int64, allowedExts []string) *FileUploader {
	exts := make(map[string]bool)
	for _, e := range allowedExts {
		exts[strings.ToLower(e)] = true
	}
	return &FileUploader{
		uploadPath:  uploadPath,
		maxSize:     maxSize,
		allowedExts: exts,
	}
}

func (u *FileUploader) Upload(file multipart.File, header *multipart.FileHeader) (string, error) {
	if header.Size > u.maxSize {
		return "", fmt.Errorf("file too large max %d bytes", u.maxSize)
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !u.allowedExts[ext] {
		return "", fmt.Errorf("file extension %s not allowed", ext)
	}

	uniqueName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String(), ext)
	fullPath := filepath.Join(u.uploadPath, uniqueName)

	if err := os.MkdirAll(u.uploadPath, 0755); err != nil {
		return "", err
	}

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	return "/uploads/" + uniqueName, nil
}
