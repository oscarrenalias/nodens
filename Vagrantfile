# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
	config.vm.box = "saucy-server-cloudimg-amd64-vagrant-disk1"
	config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/saucy/current/saucy-server-cloudimg-amd64-vagrant-disk1.box"

	config.vm.network :private_network, ip: "192.168.33.100"

	# Uncomment the lines below if you need more than 512Mb of RAM
	#config.vm.provider :virtualbox do |vb|
	#	vb.customize ["modifyvm", :id, "--memory", "1024"]
	#end

  	# Use shell provisioning, probably the easiest option
  	config.vm.provision "shell", path: "./vagrant/setup.sh"

  	# Share this folder within the Vagrant box
  	config.vm.synced_folder ".", "/home/vagrant/nodens"

end