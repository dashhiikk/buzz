package upload

import "strings"

type FileUploader struct {
	uploadPath  string
	maxSixe     int64
	allowedExts map[string]bool
}

func NewFileUploader(uploadPath string, maxSixe int64, allowedExts []string) *FileUploader {
	exts := make(map[string]bool)
	for _, e := range allowedExts {
		exts[strings.ToLower(e)] = true
	}
	return &FileUploader{
		uploadPath:  uploadPath,
		maxSixe:     maxSixe,
		allowedExts: exts,
	}
}
