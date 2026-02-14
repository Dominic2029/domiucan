import { useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

/**
 * 富文本编辑器组件（基于 react-quill）
 */
function RichTextEditor({ value, onChange, placeholder = '开始编辑...' }) {
  const quillRef = useRef(null)

  // 图片上传处理
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (file) {
        // 转换为 Base64
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target.result
          const quill = quillRef.current?.getEditor()
          if (quill) {
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, 'image', base64)
            quill.setSelection(range.index + 1)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // 配置工具栏
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}

export default RichTextEditor
