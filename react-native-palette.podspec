require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.description  = <<-DESC
                  react-native-palette
                   DESC
  s.homepage     = "https://github.com/chetstone/react-native-palette"

  s.authors      = package['author']
  s.platform     = :ios, "9.0"

  s.source       = { :git => "https://github.com/chetstone/react-native-palette.git", :tag => "v#{s.version}" }
  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency 'React'
end
